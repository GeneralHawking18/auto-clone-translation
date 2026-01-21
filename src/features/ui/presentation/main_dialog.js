/**
 * Module xử lý giao diện người dùng
 * @namespace
 */
var UIService = {
    // Dependencies (injected via init)
    _clipboardService: null,
    _fontService: null,
    _utils: null,
    _config: null,

    /**
     * Khởi tạo service với dependencies
     * @param {Object} clipboardService - ClipboardService module
     * @param {Object} fontService - FontService module
     * @param {Object} utils - Utils module
     * @param {Object} config - CONFIG object
     */
    init: function (clipboardService, fontService, utils, config) {
        this._clipboardService = clipboardService;
        this._fontService = fontService;
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Hiển thị dialog chọn nguồn dữ liệu
     * @returns {Object|null} { type: "url"|"file", data: string|File } hoặc null
     */
    showInputWindow: function () {
        // Đọc clipboard
        var clipText = this._clipboardService.read();

        // Nếu có link Sheet, dùng luôn
        if (this._utils.isGoogleSheetUrl(clipText)) {
            return { type: "url", data: clipText };
        }

        // Hiện dialog
        return this._showInputDialog();
    },

    /**
     * Hiển thị dialog input
     * @private
     */
    _showInputDialog: function () {
        var self = this;
        var win = new Window("dialog", "📋 Cần Link Google Sheet");
        win.orientation = "column";
        win.alignChildren = "center";

        win.add("statictext", undefined, "❌ Chưa có link Google Sheet trong Clipboard!");
        win.add("statictext", undefined, "");
        win.add("statictext", undefined, "👉 Hãy COPY link Sheet trước, rồi chạy lại script");
        win.add("statictext", undefined, "");
        win.add("statictext", undefined, "Hoặc chọn file local:");

        var btnGroup = win.add("group");
        var btnFile = btnGroup.add("button", undefined, "📁 Chọn File TSV/CSV");
        var btnRetry = btnGroup.add("button", undefined, "  Thử Lại", { name: "ok" });
        var btnCancel = btnGroup.add("button", undefined, "❌ Hủy", { name: "cancel" });

        var result = { type: "", data: "" };

        btnFile.onClick = function () {
            var f = File.openDialog("Chọn file TSV hoặc CSV");
            if (f) {
                result.type = "file";
                result.data = f;
                win.close(1);
            }
        };

        btnRetry.onClick = function () {
            var newClip = self._clipboardService.read();
            if (self._utils.isGoogleSheetUrl(newClip)) {
                result.type = "url";
                result.data = newClip;
                win.close(1);
            } else {
                alert("Vẫn chưa có link Sheet trong Clipboard!\nHãy copy link rồi bấm Thử Lại.");
            }
        };

        if (win.show() === 1 && result.type) {
            return result;
        }
        return null;
    },

    /**
     * Hiển thị dialog xác nhận
     * @param {string} templateName - Tên template
     * @param {number} rowCount - Số dòng dữ liệu
     * @param {Object} mappingInfo - Thông tin mapping
     * @returns {boolean} true nếu user xác nhận
     */
    showConfirmDialog: function (templateName, rowCount, mappingInfo) {
        var self = this;
        var msg = "• Template: " + templateName + "\n";
        msg += "• Số dòng dữ liệu: " + rowCount + "\n\n";
        msg += mappingInfo.text;

        if (mappingInfo.count === 0) {
            msg += "\n\n❌ CẢNH BÁO: Không khớp text nào!";
        }

        var win = new Window("dialog", this._config.UI.TITLE);
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];

        // Panel báo cáo
        var reportPanel = win.add("panel", undefined, "📊 BÁO CÁO THỐNG KÊ");
        reportPanel.alignChildren = ["fill", "top"];
        reportPanel.add("edittext", [0, 0, this._config.UI.DIALOG_WIDTH, this._config.UI.DIALOG_HEIGHT], msg,
            { multiline: true, scrolling: true, readonly: true });

        // Panel font tools
        var fontPanel = win.add("panel", undefined, "🔤 CÔNG CỤ FONT");
        fontPanel.orientation = "row";
        fontPanel.alignChildren = ["center", "center"];

        var btnExport = fontPanel.add("button", undefined, "📋 " + this._config.UI.BTN_EXPORT_FONT);
        btnExport.preferredSize = [250, 35];
        btnExport.onClick = function () {
            self._fontService.exportSystemFonts();
        };

        fontPanel.add("statictext", undefined, "→ Xuất file .txt ra Desktop");

        // Action buttons
        var grp = win.add("group");
        grp.alignment = ["center", "bottom"];

        var btnOK = grp.add("button", undefined, this._config.UI.BTN_OK, { name: "ok" });
        btnOK.preferredSize = [150, 35];

        var btnCancel = grp.add("button", undefined, this._config.UI.BTN_CANCEL, { name: "cancel" });
        btnCancel.preferredSize = [100, 35];

        return win.show() === 1;
    }
};
