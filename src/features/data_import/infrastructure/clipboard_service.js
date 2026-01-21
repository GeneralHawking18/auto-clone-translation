/**
 * Module đọc clipboard trên Windows
 * @namespace
 */
var ClipboardService = {
    // Dependencies (injected via init)
    _utils: null,
    _config: null,

    /**
     * Khởi tạo service với dependencies
     * @param {Object} utils - Utils module
     * @param {Object} config - CONFIG object
     */
    init: function (utils, config) {
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Đọc clipboard bằng VBScript
     * @returns {string|null} Nội dung clipboard hoặc null
     * @private
     */
    _readViaVBScript: function () {
        var tempFolder = Folder.temp.fsName;
        var vbsFile = new File(tempFolder + "\\get_clip.vbs");
        var outFile = new File(tempFolder + "\\clip_out.txt");

        // Cleanup file cũ
        if (outFile.exists) outFile.remove();

        // Tạo VBScript
        vbsFile.open("w");
        vbsFile.writeln('Set objHTML = CreateObject("htmlfile")');
        vbsFile.writeln('clipText = objHTML.ParentWindow.ClipboardData.GetData("text")');
        vbsFile.writeln('Set fso = CreateObject("Scripting.FileSystemObject")');
        vbsFile.writeln('Set f = fso.CreateTextFile("' + outFile.fsName.replace(/\\/g, '\\\\') + '", True, True)');
        vbsFile.writeln('If Not IsNull(clipText) Then f.Write clipText');
        vbsFile.writeln('f.Close');
        vbsFile.close();

        // Chạy VBScript
        vbsFile.execute();

        // Đợi kết quả
        var waited = 0;
        var clipText = null;

        while (waited < this._config.DELAYS.CLIPBOARD_TIMEOUT) {
            $.sleep(this._config.DELAYS.CLIPBOARD_CHECK);
            waited += this._config.DELAYS.CLIPBOARD_CHECK;

            if (outFile.exists) {
                $.sleep(this._config.DELAYS.CLIPBOARD_CHECK);
                outFile.encoding = "UTF-16";
                if (outFile.open("r")) {
                    clipText = outFile.read();
                    outFile.close();
                    break;
                }
            }
        }

        // Cleanup
        this._utils.safeExecute(function () { vbsFile.remove(); });
        this._utils.safeExecute(function () { outFile.remove(); });

        return clipText ? this._utils.trim(clipText) : null;
    },

    /**
     * Đọc clipboard bằng PowerShell (fallback)
     * @returns {string|null} Nội dung clipboard hoặc null
     * @private
     */
    _readViaPowerShell: function () {
        var tempFile = new File(Folder.temp + "/clip_ps.txt");
        var batFile = new File(Folder.temp + "/get_clip.bat");

        if (tempFile.exists) tempFile.remove();

        batFile.open("w");
        batFile.writeln('@echo off');
        batFile.writeln('powershell -command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Clipboard" > "' + tempFile.fsName + '"');
        batFile.close();
        batFile.execute();

        $.sleep(1500);

        var clipText = null;
        if (tempFile.exists) {
            tempFile.encoding = "UTF-8";
            tempFile.open("r");
            clipText = tempFile.read();
            tempFile.close();
            tempFile.remove();
            batFile.remove();
        }

        return clipText ? this._utils.trim(clipText) : null;
    },

    /**
     * Đọc nội dung từ clipboard
     * @returns {string} Nội dung clipboard hoặc chuỗi rỗng
     */
    read: function () {
        var self = this;
        var result = this._readViaVBScript();

        if (!result) {
            result = this._utils.safeExecute(
                function () { return self._readViaPowerShell(); },
                null
            );
        }

        return result || "";
    }
};
