/**
 * Module xử lý đọc và parse file CSV/TSV
 * @namespace
 */
var CSVService = {
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
     * Tải file từ URL về máy
     * @param {string} url - URL cần tải
     * @returns {File} File đã tải
     * @throws {Error} Nếu không tải được
     */
    download: function (url) {
        var exportUrl = this._utils.convertSheetUrl(url);
        var tempFile = new File(Folder.temp + "/" + this._config.TEMP_FILENAME);

        if (this._utils.isWindows()) {
            this._downloadWindows(exportUrl, tempFile);
        } else {
            this._downloadMac(exportUrl, tempFile);
        }

        $.sleep(this._config.DELAYS.DOWNLOAD);

        if (!tempFile.exists) {
            throw new Error(this._config.MESSAGES.DOWNLOAD_ERROR);
        }

        return tempFile;
    },

    /**
     * Tải file trên Windows
     * @private
     */
    _downloadWindows: function (url, targetFile) {
        var batFile = new File(Folder.temp + "/download_csv.bat");
        batFile.open("w");
        batFile.writeln('@echo off');
        batFile.writeln('curl -L "' + url + '" -o "' + targetFile.fsName + '"');
        batFile.close();
        batFile.execute();
    },

    /**
     * Tải file trên Mac
     * @private
     */
    _downloadMac: function (url, targetFile) {
        var shFile = new File(Folder.temp + "/download_csv.sh");
        shFile.open("w");
        shFile.writeln('#!/bin/bash');
        shFile.writeln('curl -L "' + url + '" -o "' + targetFile.fsName + '"');
        shFile.close();
        shFile.execute();
    },

    /**
     * Parse một dòng CSV/TSV
     * @param {string} line - Dòng cần parse
     * @param {string} separator - Dấu phân cách
     * @returns {Array<string>} Mảng các giá trị
     */
    parseLine: function (line, separator) {
        // TAB thì đơn giản split
        if (separator === "\t") {
            return line.split(separator);
        }

        // COMMA cần xử lý quoted fields
        var result = [];
        var current = "";
        var inQuotes = false;

        for (var i = 0; i < line.length; i++) {
            var ch = line.charAt(i);

            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === separator && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current);

        return result;
    },

    /**
     * Phát hiện dấu phân cách trong file
     * @param {string} firstLine - Dòng đầu tiên
     * @returns {string} Dấu phân cách
     * @private
     */
    _detectSeparator: function (firstLine) {
        if (firstLine.indexOf("\t") !== -1) return "\t";
        if (firstLine.indexOf(",") !== -1) return ",";
        return this._config.DEFAULT_SEPARATOR;
    },

    /**
     * Parse toàn bộ file CSV/TSV
     * @param {File} fileObj - File cần parse
     * @returns {Object} Dữ liệu đã parse
     * @throws {Error} Nếu file không hợp lệ
     */
    parse: function (fileObj) {
        if (!fileObj) return null;

        if (!fileObj.open("r")) {
            throw new Error("Không thể đọc file: " + fileObj.fsName);
        }

        var content = fileObj.read();
        fileObj.close();

        // Kiểm tra HTML response (do Google yêu cầu đăng nhập)
        if (content.indexOf("<!DOCTYPE html>") !== -1 || content.indexOf("<html") !== -1) {
            throw new Error(this._config.MESSAGES.ACCESS_ERROR);
        }

        var lines = content.split(/\r?\n/);
        if (lines.length > 0 && lines[lines.length - 1] === "") {
            lines.pop();
        }

        if (lines.length < this._config.MIN_CSV_LINES) {
            throw new Error(this._config.MESSAGES.MIN_LINES_ERROR);
        }

        var separator = this._detectSeparator(lines[0]);

        // Parse headers (dòng 1)
        var headers = this._parseHeaders(lines[0], separator);

        // Parse reference values (dòng 2)
        var referenceData = this._parseReference(lines[1], headers, separator);

        // Parse data rows (dòng 3+)
        var dataRows = this._parseDataRows(lines, separator);

        return {
            headers: headers,
            referenceMap: referenceData.normalized,
            referenceMapOriginal: referenceData.original,
            rows: lines.slice(2),
            dataRows: dataRows,
            separator: separator
        };
    },

    /**
     * Parse dòng headers
     * @private
     */
    _parseHeaders: function (line, separator) {
        var rawHeader = this.parseLine(line, separator);
        var headers = [];
        for (var i = 0; i < rawHeader.length; i++) {
            headers.push(this._utils.normalizeKey(rawHeader[i]));
        }
        return headers;
    },

    /**
     * Parse dòng reference
     * @private
     */
    _parseReference: function (line, headers, separator) {
        var rawReference = this.parseLine(line, separator);
        var normalized = {};
        var original = {};

        for (var j = 0; j < headers.length; j++) {
            var refValue = this._utils.trim(this._utils.safeGet(rawReference, j, ""));
            normalized[headers[j]] = this._utils.normalizeForCompare(refValue);
            original[headers[j]] = refValue;
        }

        return { normalized: normalized, original: original };
    },

    /**
     * Parse các dòng dữ liệu
     * @private
     */
    _parseDataRows: function (lines, separator) {
        var dataRows = [];
        for (var r = 2; r < lines.length; r++) {
            dataRows.push(this.parseLine(lines[r], separator));
        }
        return dataRows;
    }
};
