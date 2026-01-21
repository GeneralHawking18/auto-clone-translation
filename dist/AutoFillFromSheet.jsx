// Auto-Generated File via build.js
// DO NOT EDIT DIRECTLY


// ==========================================
// FILE: core/config/config.js
// ==========================================
/**
 * Cấu hình chung của script
 * @type {Object}
 */
var CONFIG = {
    /** Khoảng cách giữa các bản clone (pixels) */
    SPACING: 30,

    /** Dấu phân cách mặc định (TAB tốt nhất cho design) */
    DEFAULT_SEPARATOR: "\t",

    /** So sánh có phân biệt hoa thường không */
    CASE_SENSITIVE: false,

    /** Số dòng tối thiểu trong file CSV (Header + Reference + Data) */
    MIN_CSV_LINES: 3,

    /** Tên cột chứa thông tin font */
    MASTER_FONT_KEY: "font",

    /** Tên file tạm khi tải từ internet */
    TEMP_FILENAME: "temp_data_illustrator.tsv",

    /** Số bản clone trước mỗi lần redraw */
    REDRAW_INTERVAL: 5,

    /** Độ trễ cho các thao tác async (ms) */
    DELAYS: {
        DOWNLOAD: 1000,
        CLIPBOARD_CHECK: 100,
        CLIPBOARD_TIMEOUT: 3000,
        REFRESH: 100,
        NUDGE: 50
    },

    /** Cấu hình giao diện */
    UI: {
        TITLE: "Tool Auto Fill: Sheet URL & Font",
        BTN_OK: "OK - CHẠY NGAY",
        BTN_CANCEL: "HỦY BỎ",
        BTN_EXPORT_FONT: "Lấy tên Font chuẩn",
        DIALOG_WIDTH: 550,
        DIALOG_HEIGHT: 320
    },

    /** Messages */
    MESSAGES: {
        NO_DOC: "Vui lòng mở file Illustrator.",
        NO_SELECTION: "⚠️ Bạn chưa chọn Group mẫu nào!",
        MULTI_SELECTION: "⚠️ Chỉ chọn 1 Group duy nhất.",
        NOT_GROUP: "⚠️ Đối tượng chọn phải là Group.",
        DOWNLOAD_ERROR: "Không thể tải file từ URL.\n1. Kiểm tra lại mạng.\n2. Đảm bảo Link Sheet đã bật 'Anyone with the link'.",
        ACCESS_ERROR: "LỖI QUYỀN TRUY CẬP!\nGoogle bắt đăng nhập.\nHãy chia sẻ Sheet ở chế độ: 'Anyone with the link' (Bất kỳ ai có đường dẫn).",
        MIN_LINES_ERROR: "File cần ít nhất 3 dòng: Header + Reference + Data."
    }
};


// ==========================================
// FILE: core/utils/common_utils.js
// ==========================================
/**
 * Module chứa các hàm tiện ích dùng chung
 * @namespace
 */
var Utils = {
    /**
     * Trim whitespace từ đầu và cuối chuỗi
     * @param {string} str - Chuỗi cần trim
     * @returns {string} Chuỗi đã trim
     */
    trim: function (str) {
        if (!str) return "";
        return str.replace(/^\s+|\s+$/g, '');
    },

    /**
     * Chuẩn hóa key (trim + lowercase nếu không case sensitive)
     * @param {string} str - Chuỗi cần chuẩn hóa
     * @returns {string} Chuỗi đã chuẩn hóa
     */
    normalizeKey: function (str) {
        var clean = this.trim(str);
        return CONFIG.CASE_SENSITIVE ? clean : clean.toLowerCase();
    },

    /**
     * Chuẩn hóa để so sánh (luôn trim + lowercase)
     * @param {string} str - Chuỗi cần chuẩn hóa
     * @returns {string} Chuỗi đã chuẩn hóa
     */
    normalizeForCompare: function (str) {
        return this.trim(str).toLowerCase();
    },

    /**
     * Kiểm tra có đang chạy trên Windows không
     * @returns {boolean}
     */
    isWindows: function () {
        return $.os.indexOf("Windows") !== -1;
    },

    /**
     * Kiểm tra có phải URL Google Sheet không
     * @param {string} url - URL cần kiểm tra
     * @returns {boolean}
     */
    isGoogleSheetUrl: function (url) {
        return url && url.indexOf("docs.google.com/spreadsheets") !== -1;
    },

    /**
     * Chuyển đổi Google Sheet URL sang export URL
     * @param {string} url - URL gốc
     * @returns {string} Export URL
     */
    convertSheetUrl: function (url) {
        if (this.isGoogleSheetUrl(url)) {
            var cleanUrl = url.replace(/\/edit.*$/, "");
            return cleanUrl + "/export?format=csv";
        }
        return url;
    },

    /**
     * Ghi nội dung ra file trên Desktop
     * @param {string} content - Nội dung cần ghi
     * @param {string} fileName - Tên file
     * @returns {string} Đường dẫn file
     */
    writeLog: function (content, fileName) {
        var path = Folder.desktop + "/" + fileName;
        var file = new File(path);
        file.encoding = "UTF-8";
        if (file.open("w")) {
            file.write(content);
            file.close();
        }
        return path;
    },

    /**
     * Thực thi hàm với error handling
     * @param {Function} fn - Hàm cần thực thi
     * @param {*} defaultValue - Giá trị mặc định nếu lỗi
     * @returns {*} Kết quả hoặc defaultValue
     */
    safeExecute: function (fn, defaultValue) {
        try {
            return fn();
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Lấy giá trị từ mảng một cách an toàn
     * @param {Array} arr - Mảng
     * @param {number} index - Index
     * @param {*} defaultValue - Giá trị mặc định
     * @returns {*}
     */
    safeGet: function (arr, index, defaultValue) {
        return (arr && arr[index] !== undefined) ? arr[index] : (defaultValue || "");
    }
};


// ==========================================
// FILE: features/data_import/domain/entities/csv_row.js
// ==========================================
/**
 * Entity: CsvRow
 * Đại diện cho một dòng dữ liệu đã được parse từ CSV
 * @namespace
 */
var CsvRow = {
    /**
     * Tạo entity CsvRow mới
     * @param {Object} data - Raw data object
     * @returns {Object} CsvRow entity
     */
    create: function (data) {
        return {
            headers: data.headers || [],
            referenceMap: data.referenceMap || {},
            referenceMapOriginal: data.referenceMapOriginal || {},
            rows: data.rows || [],
            dataRows: data.dataRows || [],
            separator: data.separator || "\t"
        };
    },

    /**
     * Kiểm tra entity có hợp lệ không
     * @param {Object} entity
     * @returns {boolean}
     */
    isValid: function (entity) {
        return entity &&
            entity.headers &&
            entity.headers.length > 0 &&
            entity.rows.length > 0;
    }
};


// ==========================================
// FILE: features/font_manager/domain/entities/font_info.js
// ==========================================
/**
 * Entity: FontInfo
 * Đại diện cho thông tin một font
 * @namespace
 */
var FontInfo = {
    /**
     * Tạo entity FontInfo mới
     * @param {string} name - Tên font
     * @param {boolean} exists - Font có tồn tại trong hệ thống không
     * @param {string} matchedName - Tên font thực sự được match
     * @returns {Object} FontInfo entity
     */
    create: function (name, exists, matchedName) {
        return {
            name: name || "",
            exists: exists || false,
            matchedName: matchedName || ""
        };
    },

    /**
     * Tạo entity từ kết quả check
     * @param {string} name
     * @param {Object} checkResult - { exists, matchedName }
     * @returns {Object}
     */
    fromCheckResult: function (name, checkResult) {
        return this.create(
            name,
            checkResult.exists,
            checkResult.matchedName
        );
    }
};


// ==========================================
// FILE: features/template_engine/domain/entities/template_group.js
// ==========================================
/**
 * Entity: TemplateGroup
 * Đại diện cho một Group template trong Illustrator
 * @namespace
 */
var TemplateGroup = {
    /**
     * Tạo entity TemplateGroup từ GroupItem
     * @param {GroupItem} groupItem - Illustrator GroupItem
     * @returns {Object} TemplateGroup entity
     */
    create: function (groupItem) {
        return {
            name: groupItem.name || "Unnamed",
            width: groupItem.width || 0,
            height: groupItem.height || 0,
            top: groupItem.top || 0,
            left: groupItem.left || 0,
            _nativeObject: groupItem
        };
    },

    /**
     * Lấy native Illustrator object
     * @param {Object} entity
     * @returns {GroupItem}
     */
    getNative: function (entity) {
        return entity._nativeObject;
    }
};


// ==========================================
// FILE: features/data_import/application/interfaces/data_reader.js
// ==========================================
/**
 * Interface: IDataReader
 * Định nghĩa contract cho các service đọc dữ liệu
 * 
 * @interface
 * 
 * Các class implement interface này phải có:
 * - init(utils, config): Khởi tạo với dependencies
 * - download(url): Tải file từ URL, trả về File object
 * - parse(fileObj): Parse file, trả về CsvRow entity
 * - parseLine(line, separator): Parse một dòng, trả về Array
 */
var IDataReader = {
    /**
     * @abstract
     * @param {Object} utils
     * @param {Object} config
     */
    init: function (utils, config) {
        throw new Error("IDataReader.init() must be implemented");
    },

    /**
     * @abstract
     * @param {string} url
     * @returns {File}
     */
    download: function (url) {
        throw new Error("IDataReader.download() must be implemented");
    },

    /**
     * @abstract
     * @param {File} fileObj
     * @returns {Object} CsvRow entity
     */
    parse: function (fileObj) {
        throw new Error("IDataReader.parse() must be implemented");
    }
};


// ==========================================
// FILE: features/font_manager/application/interfaces/font_repository.js
// ==========================================
/**
 * Interface: IFontRepository
 * Định nghĩa contract cho các service xử lý font
 * 
 * @interface
 * 
 * Các class implement interface này phải có:
 * - init(utils): Khởi tạo với dependencies
 * - findByName(fontName): Tìm font, trả về TextFont hoặc null
 * - checkExists(fontName): Kiểm tra font, trả về FontInfo entity
 * - applyToTextFrame(textFrame, font): Áp dụng font cho TextFrame
 * - analyzeRequired(dataRows, fontColumnIndex): Phân tích font cần dùng
 * - exportSystemFonts(): Xuất danh sách font hệ thống
 */
var IFontRepository = {
    /**
     * @abstract
     * @param {Object} utils
     */
    init: function (utils) {
        throw new Error("IFontRepository.init() must be implemented");
    },

    /**
     * @abstract
     * @param {string} fontName
     * @returns {TextFont|null}
     */
    findByName: function (fontName) {
        throw new Error("IFontRepository.findByName() must be implemented");
    },

    /**
     * @abstract
     * @param {string} fontName
     * @returns {Object} FontInfo entity
     */
    checkExists: function (fontName) {
        throw new Error("IFontRepository.checkExists() must be implemented");
    },

    /**
     * @abstract
     * @param {TextFrame} textFrame
     * @param {TextFont} font
     */
    applyToTextFrame: function (textFrame, font) {
        throw new Error("IFontRepository.applyToTextFrame() must be implemented");
    }
};


// ==========================================
// FILE: features/template_engine/application/interfaces/template_service.js
// ==========================================
/**
 * Interface: ITemplateService
 * Định nghĩa contract cho các service xử lý template
 * 
 * @interface
 * 
 * Các class implement interface này phải có:
 * - init(fontService, utils, config): Khởi tạo với dependencies
 * - getSelectedTemplate(): Lấy Group template đang chọn
 * - getAllTextFrames(container): Lấy tất cả TextFrame trong container
 * - analyzeMapping(group, headers, referenceMap, dataRows): Phân tích mapping
 * - createClone(template, rowIndex, dataDict, referenceMap): Tạo clone
 * - forceRefresh(templateGroup): Refresh màn hình
 */
var ITemplateService = {
    /**
     * @abstract
     * @param {Object} fontService
     * @param {Object} utils
     * @param {Object} config
     */
    init: function (fontService, utils, config) {
        throw new Error("ITemplateService.init() must be implemented");
    },

    /**
     * @abstract
     * @returns {GroupItem}
     * @throws {Error} Nếu không có selection phù hợp
     */
    getSelectedTemplate: function () {
        throw new Error("ITemplateService.getSelectedTemplate() must be implemented");
    },

    /**
     * @abstract
     * @param {PageItem} container
     * @returns {Array<TextFrame>}
     */
    getAllTextFrames: function (container) {
        throw new Error("ITemplateService.getAllTextFrames() must be implemented");
    },

    /**
     * @abstract
     * @param {GroupItem} group
     * @param {Array} headers
     * @param {Object} referenceMap
     * @param {Array} dataRows
     * @returns {Object} { text, count, hasMasterFont }
     */
    analyzeMapping: function (group, headers, referenceMap, dataRows) {
        throw new Error("ITemplateService.analyzeMapping() must be implemented");
    },

    /**
     * @abstract
     * @param {GroupItem} template
     * @param {number} rowIndex
     * @param {Object} dataDict
     * @param {Object} referenceMap
     */
    createClone: function (template, rowIndex, dataDict, referenceMap) {
        throw new Error("ITemplateService.createClone() must be implemented");
    }
};


// ==========================================
// FILE: features/data_import/infrastructure/clipboard_service.js
// ==========================================
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


// ==========================================
// FILE: features/data_import/infrastructure/csv_service.js
// ==========================================
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


// ==========================================
// FILE: features/font_manager/infrastructure/font_service.js
// ==========================================
/**
 * Module xử lý font trong Illustrator
 * @namespace
 */
var FontService = {
    // Dependencies (injected via init)
    _utils: null,

    /**
     * Khởi tạo service với dependencies
     * @param {Object} utils - Utils module
     */
    init: function (utils) {
        this._utils = utils;
        return this;
    },

    /**
     * Tìm font theo tên (exact match hoặc fuzzy match)
     * @param {string} fontName - Tên font cần tìm
     * @returns {TextFont|null} Font object hoặc null
     */
    findByName: function (fontName) {
        if (!fontName || fontName === "") return null;

        // Thử exact match trước
        var font = this._utils.safeExecute(function () {
            return app.textFonts.getByName(fontName);
        });

        if (font) return font;

        // Fuzzy match
        return this._fuzzySearch(fontName);
    },

    /**
     * Tìm font bằng fuzzy matching
     * @param {string} fontName - Tên font gốc
     * @returns {TextFont|null}
     * @private
     */
    _fuzzySearch: function (fontName) {
        var fnLower = fontName.toLowerCase();
        var fnNoSpace = fontName.replace(/\s+/g, '').toLowerCase();
        var fnWithHyphen = fontName.replace(/\s+/g, '-').toLowerCase();

        try {
            var allFonts = app.textFonts;

            for (var i = 0; i < allFonts.length; i++) {
                var sysFont = allFonts[i];
                var sysFontName = sysFont.name;
                var sysFontLower = sysFontName.toLowerCase();
                var sysFontNoSpace = sysFontName.replace(/[\s\-]+/g, '').toLowerCase();

                // Nhiều cách so sánh
                if (sysFontLower === fnLower ||
                    sysFontNoSpace === fnNoSpace ||
                    sysFontLower === fnWithHyphen ||
                    sysFontNoSpace.indexOf(fnNoSpace) !== -1 ||
                    sysFontLower.indexOf(fnLower) !== -1 ||
                    sysFont.family.toLowerCase().indexOf(fnLower) !== -1) {
                    return sysFont;
                }
            }
        } catch (e) { }

        return null;
    },

    /**
     * Kiểm tra font có tồn tại không và trả về thông tin
     * @param {string} fontName - Tên font
     * @returns {Object} { exists: boolean, matchedName: string }
     */
    checkExists: function (fontName) {
        var font = this.findByName(fontName);
        return {
            exists: font !== null,
            matchedName: font ? font.name : ""
        };
    },

    /**
     * Áp dụng font cho TextFrame (thử nhiều cách)
     * @param {TextFrame} textFrame - TextFrame cần áp font
     * @param {TextFont} font - Font cần áp
     */
    applyToTextFrame: function (textFrame, font) {
        if (!font || !textFrame) return;

        // Cách 1: Áp dụng cho toàn bộ textRange
        this._utils.safeExecute(function () {
            textFrame.textRange.characterAttributes.textFont = font;
        });

        // Cách 2: Áp dụng cho từng character
        this._utils.safeExecute(function () {
            for (var c = 0; c < textFrame.characters.length; c++) {
                textFrame.characters[c].characterAttributes.textFont = font;
            }
        });

        // Cách 3: Áp dụng qua story
        this._utils.safeExecute(function () {
            textFrame.story.textRange.characterAttributes.textFont = font;
        });
    },

    /**
     * Phân tích các font cần dùng từ dữ liệu
     * @param {Array<Array>} dataRows - Các dòng dữ liệu
     * @param {number} fontColumnIndex - Index của cột font
     * @returns {Object} { fontList: Array, fontStats: Object }
     */
    analyzeRequired: function (dataRows, fontColumnIndex) {
        var fontStats = {};
        var fontList = [];

        for (var r = 0; r < dataRows.length; r++) {
            var fontName = this._utils.trim(this._utils.safeGet(dataRows[r], fontColumnIndex, ""));

            if (fontName !== "") {
                if (!fontStats.hasOwnProperty(fontName)) {
                    fontStats[fontName] = 0;
                    fontList.push(fontName);
                }
                fontStats[fontName]++;
            }
        }

        return { fontList: fontList, fontStats: fontStats };
    },

    /**
     * Xuất danh sách font hệ thống ra file
     * @returns {string|null} Đường dẫn file hoặc null nếu lỗi
     */
    exportSystemFonts: function () {
        var self = this;
        try {
            var fonts = app.textFonts;
            var fontCount = fonts.length;
            var content = "";

            for (var i = 0; i < fontCount; i++) {
                this._utils.safeExecute(function () {
                    content += fonts[i].name + "\n";
                });
            }

            var path = this._utils.writeLog(content, "DanhSachFont_Illustrator.txt");
            alert("Da xuat " + fontCount + " font ra Desktop:\n" + path);
            return path;
        } catch (e) {
            alert("Loi khi xuat font: " + e.message);
            return null;
        }
    }
};


// ==========================================
// FILE: features/template_engine/infrastructure/ai_service.js
// ==========================================
/**
 * Module xử lý các thao tác với Illustrator
 * @namespace
 */
var AIService = {
    // Dependencies (injected via init)
    _fontService: null,
    _utils: null,
    _config: null,

    /**
     * Khởi tạo service với dependencies
     * @param {Object} fontService - FontService module
     * @param {Object} utils - Utils module
     * @param {Object} config - CONFIG object
     */
    init: function (fontService, utils, config) {
        this._fontService = fontService;
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Lấy Group template đang được chọn
     * @returns {GroupItem} Group được chọn
     * @throws {Error} Nếu không có selection phù hợp
     */
    getSelectedTemplate: function () {
        if (app.documents.length === 0) {
            throw new Error(this._config.MESSAGES.NO_DOC);
        }

        var selection = app.activeDocument.selection;

        if (!selection || selection.length === 0) {
            throw new Error(this._config.MESSAGES.NO_SELECTION);
        }
        if (selection.length > 1) {
            throw new Error(this._config.MESSAGES.MULTI_SELECTION);
        }
        if (selection[0].typename !== "GroupItem") {
            throw new Error(this._config.MESSAGES.NOT_GROUP);
        }

        return selection[0];
    },

    /**
     * Lấy tất cả TextFrame trong container (đệ quy)
     * @param {PageItem} container - Container cần tìm
     * @param {Array} [result] - Mảng kết quả (dùng nội bộ)
     * @returns {Array<TextFrame>} Danh sách TextFrame
     */
    getAllTextFrames: function (container, result) {
        if (!result) result = [];

        for (var i = 0; i < container.pageItems.length; i++) {
            var item = container.pageItems[i];
            if (item.typename === "TextFrame") {
                result.push(item);
            } else if (item.typename === "GroupItem") {
                this.getAllTextFrames(item, result);
            }
        }

        return result;
    },

    /**
     * Tìm index của cột font trong headers
     * @param {Array<string>} headers - Danh sách headers
     * @returns {number} Index hoặc -1 nếu không tìm thấy
     * @private
     */
    _findFontColumnIndex: function (headers) {
        for (var h = 0; h < headers.length; h++) {
            if (headers[h] === this._config.MASTER_FONT_KEY) {
                return h;
            }
        }
        return -1;
    },

    /**
     * Phân tích và tạo báo cáo mapping
     * @param {GroupItem} group - Group template
     * @param {Array} headers - Headers
     * @param {Object} referenceMap - Map reference values
     * @param {Array} dataRows - Các dòng dữ liệu
     * @returns {Object} { text: string, count: number, hasMasterFont: boolean }
     */
    analyzeMapping: function (group, headers, referenceMap, dataRows) {
        var frames = this.getAllTextFrames(group);
        var fontColumnIndex = this._findFontColumnIndex(headers);
        var hasMasterFont = fontColumnIndex !== -1;

        // Tạo báo cáo text mapping
        var textReport = this._buildTextMappingReport(frames, headers, referenceMap);

        // Tạo báo cáo font
        var fontReport = this._buildFontReport(dataRows, fontColumnIndex, hasMasterFont);

        // Gộp báo cáo
        var report = textReport.lines.concat([""], fontReport.lines, ["", "═══════════════════════════════════════════"]);

        return {
            text: report.join("\n"),
            count: textReport.matchCount,
            hasMasterFont: hasMasterFont
        };
    },

    /**
     * Tạo báo cáo text mapping
     * @private
     */
    _buildTextMappingReport: function (frames, headers, referenceMap) {
        var report = [
            "═══════════════════════════════════════════",
            "📝 DANH SÁCH TEXT SẼ ĐƯỢC THAY THẾ:",
            "═══════════════════════════════════════════"
        ];
        var matchCount = 0;

        for (var i = 0; i < frames.length; i++) {
            var content = this._utils.trim(frames[i].contents);
            var contentNormalized = this._utils.normalizeForCompare(content);

            // Tìm header khớp với reference value
            for (var k = 0; k < headers.length; k++) {
                var refText = referenceMap[headers[k]];
                if (refText && contentNormalized === refText) {
                    report.push("  ✅ [" + headers[k].toUpperCase() + "] → '" + content + "'");
                    matchCount++;
                    break;
                }
            }
        }

        if (matchCount === 0) {
            report.push("  ❌ Không có text nào khớp!");
        }

        return { lines: report, matchCount: matchCount };
    },

    /**
     * Tạo báo cáo font
     * @private
     */
    _buildFontReport: function (dataRows, fontColumnIndex, hasMasterFont) {
        var report = [
            "═══════════════════════════════════════════",
            "🎨 DANH SÁCH FONT SẼ ĐƯỢC ÁP DỤNG:",
            "═══════════════════════════════════════════"
        ];

        if (!hasMasterFont) {
            report.push("  ⚠️ Không có cột '" + this._config.MASTER_FONT_KEY + "' trong data");
            report.push("  → Giữ nguyên font gốc của template");
            return { lines: report };
        }

        if (!dataRows || dataRows.length === 0) {
            report.push("  ⚠️ Không có dữ liệu");
            return { lines: report };
        }

        var fontAnalysis = this._fontService.analyzeRequired(dataRows, fontColumnIndex);
        var fontList = fontAnalysis.fontList;
        var fontStats = fontAnalysis.fontStats;

        if (fontList.length === 0) {
            report.push("  ⚠️ Cột 'font' trống - không đổi font");
            return { lines: report };
        }

        report.push("  📊 Tổng số font khác nhau: " + fontList.length);
        report.push("");

        // Liệt kê từng font
        for (var f = 0; f < fontList.length; f++) {
            var fn = fontList[f];
            var count = fontStats[fn];
            var fontInfo = this._fontService.checkExists(fn);

            var fontStatus = fontInfo.exists ? "✅" : "⚠️ (Không tìm thấy)";
            var displayText = "  " + fontStatus + " \"" + fn + "\"";

            if (fontInfo.exists && fontInfo.matchedName !== "" && fontInfo.matchedName !== fn) {
                displayText += " → sẽ dùng: \"" + fontInfo.matchedName + "\"";
            }
            displayText += " → " + count + " dòng";
            report.push(displayText);
        }

        // Preview dữ liệu
        report.push("");
        report.push("  📋 Preview dữ liệu (5 dòng đầu):");
        var previewCount = Math.min(5, dataRows.length);

        for (var p = 0; p < previewCount; p++) {
            var pFont = this._utils.trim(this._utils.safeGet(dataRows[p], fontColumnIndex, "(không có)"));
            report.push("     Dòng " + (p + 1) + ": " + pFont);
        }

        if (dataRows.length > 5) {
            report.push("     ... và " + (dataRows.length - 5) + " dòng nữa");
        }

        return { lines: report };
    },

    /**
     * Tạo bản clone từ template
     * @param {GroupItem} template - Template gốc
     * @param {number} rowIndex - Index của dòng dữ liệu
     * @param {Object} dataDict - Dictionary dữ liệu
     * @param {Object} referenceMap - Map reference values
     */
    createClone: function (template, rowIndex, dataDict, referenceMap) {
        var newGroup = template.duplicate();
        newGroup.name = "Row_" + (rowIndex + 1);

        // Đặt vị trí
        this._positionClonedGroup(newGroup, template, rowIndex);

        // Lấy font cho dòng này
        var rowFont = this._getRowFont(dataDict);

        // Thay thế nội dung text
        var frames = this.getAllTextFrames(newGroup);
        for (var i = 0; i < frames.length; i++) {
            this._processTextFrame(frames[i], dataDict, referenceMap, rowFont);
        }

        // Force refresh group
        this._nudgeElement(newGroup, 0.1);
    },

    /**
     * Đặt vị trí cho group đã clone
     * @private
     */
    _positionClonedGroup: function (newGroup, template, rowIndex) {
        var step = rowIndex + 1;
        var blockHeight = template.height + this._config.SPACING;
        newGroup.top = template.top - (blockHeight * step);
        newGroup.left = template.left;
    },

    /**
     * Lấy font cho dòng dữ liệu
     * @private
     */
    _getRowFont: function (dataDict) {
        if (!dataDict.hasOwnProperty(this._config.MASTER_FONT_KEY)) {
            return null;
        }

        var fontName = dataDict[this._config.MASTER_FONT_KEY];
        return this._fontService.findByName(fontName);
    },

    /**
     * Xử lý một TextFrame
     * @private
     */
    _processTextFrame: function (tf, dataDict, referenceMap, rowFont) {
        try {
            var content = this._utils.trim(tf.contents);
            var contentNormalized = this._utils.normalizeForCompare(content);

            // Tìm key phù hợp
            var matchedKey = null;
            for (var key in referenceMap) {
                if (referenceMap.hasOwnProperty(key) && referenceMap[key] === contentNormalized) {
                    matchedKey = key;
                    break;
                }
            }

            if (!matchedKey || !dataDict.hasOwnProperty(matchedKey)) {
                return;
            }

            // Lưu thuộc tính gốc
            var originalAttrs = this._saveTextAttributes(tf);

            // Thay nội dung
            tf.contents = dataDict[matchedKey];

            // Áp dụng font
            if (rowFont) {
                this._fontService.applyToTextFrame(tf, rowFont);
            }

            // Khôi phục thuộc tính
            this._restoreTextAttributes(tf, originalAttrs);

            // Nudge để refresh
            this._nudgeElement(tf, 0.01);

        } catch (e) { }
    },

    /**
     * Lưu các thuộc tính text
     * @private
     */
    _saveTextAttributes: function (tf) {
        var self = this;
        var attrs = {
            justification: null,
            size: null,
            tracking: null
        };

        this._utils.safeExecute(function () {
            attrs.justification = tf.paragraphs[0].paragraphAttributes.justification;
        });

        this._utils.safeExecute(function () {
            attrs.size = tf.textRange.characterAttributes.size;
            attrs.tracking = tf.textRange.characterAttributes.tracking;
        });

        return attrs;
    },

    /**
     * Khôi phục các thuộc tính text
     * @private
     */
    _restoreTextAttributes: function (tf, attrs) {
        if (attrs.justification !== null) {
            this._utils.safeExecute(function () {
                tf.paragraphs[0].paragraphAttributes.justification = attrs.justification;
            });
        }

        if (attrs.size !== null) {
            this._utils.safeExecute(function () {
                tf.textRange.characterAttributes.size = attrs.size;
            });
        }

        if (attrs.tracking !== null) {
            this._utils.safeExecute(function () {
                tf.textRange.characterAttributes.tracking = attrs.tracking;
            });
        }
    },

    /**
     * Nudge element để force refresh
     * @private
     */
    _nudgeElement: function (element, offset) {
        this._utils.safeExecute(function () {
            var originalLeft = element.left;
            var originalTop = element.top;
            element.left = originalLeft + offset;
            element.top = originalTop + offset;
            element.left = originalLeft;
            element.top = originalTop;
        });
    },

    /**
     * Force refresh màn hình
     */
    forceRefresh: function (templateGroup) {
        var self = this;
        // Redraw nhiều lần
        app.redraw();
        $.sleep(this._config.DELAYS.REFRESH);
        app.redraw();

        // Bỏ chọn rồi chọn lại
        app.activeDocument.selection = null;
        $.sleep(this._config.DELAYS.NUDGE);
        templateGroup.selected = true;
        $.sleep(this._config.DELAYS.NUDGE);
        app.activeDocument.selection = null;

        // Zoom trick
        this._utils.safeExecute(function () {
            var doc = app.activeDocument;
            var currentView = doc.views[0];
            var originalZoom = currentView.zoom;
            currentView.zoom = originalZoom * 1.01;
            app.redraw();
            $.sleep(self._config.DELAYS.NUDGE);
            currentView.zoom = originalZoom;
            app.redraw();
        });
    }
};


// ==========================================
// FILE: features/ui/presentation/main_dialog.js
// ==========================================
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


// ==========================================
// FILE: main.jsx
// ==========================================
/**
 * Module điều khiển luồng chính của ứng dụng
 * @namespace
 */
var App = {
    // Dependencies (injected via init)
    _aiService: null,
    _csvService: null,
    _uiService: null,
    _config: null,
    _utils: null,

    /**
     * Khởi tạo App với dependencies
     * @param {Object} aiService - AIService
     * @param {Object} csvService - CSVService
     * @param {Object} uiService - UIService
     * @param {Object} utils - Utils
     * @param {Object} config - CONFIG
     */
    init: function (aiService, csvService, uiService, utils, config) {
        this._aiService = aiService;
        this._csvService = csvService;
        this._uiService = uiService;
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Chạy ứng dụng
     */
    run: function () {
        try {
            // Bước 1: Lấy template
            var templateGroup = this._aiService.getSelectedTemplate();

            // Bước 2: Lấy nguồn dữ liệu
            var csvFile = this._getDataSource();
            if (!csvFile) return;

            // Bước 3: Parse và xác nhận
            var csvData = this._csvService.parse(csvFile);
            var mappingInfo = this._aiService.analyzeMapping(
                templateGroup,
                csvData.headers,
                csvData.referenceMap,
                csvData.dataRows
            );

            if (!this._uiService.showConfirmDialog(templateGroup.name, csvData.rows.length, mappingInfo)) {
                return;
            }

            // Bước 4: Safe Save & Tạo clones
            app.activeDocument.save();
            var created = this._createClones(templateGroup, csvData);

            // Bước 5: Refresh màn hình
            this._aiService.forceRefresh(templateGroup);

            // Hoàn thành
            alert("Xong rồi đấy! Đã xử lý " + created + " bản.");

        } catch (e) {
            alert("❌ LỖI: " + e.message);
        }
    },

    /**
     * Lấy nguồn dữ liệu
     * @returns {File|null}
     * @private
     */
    _getDataSource: function () {
        var source = this._uiService.showInputWindow();
        if (!source) return null;

        if (source.type === "url") {
            return this._csvService.download(source.data);
        }

        return source.data;
    },

    /**
     * Tạo các bản clone
     * @param {GroupItem} templateGroup
     * @param {Object} csvData
     * @returns {number} Số bản đã tạo
     * @private
     */
    _createClones: function (templateGroup, csvData) {
        app.activeDocument.selection = null;
        var created = 0;

        for (var i = 0; i < csvData.rows.length; i++) {
            var line = csvData.rows[i];
            if (!line || line.replace(/\s+/g, "") === "") continue;

            var values = line.split(csvData.separator);
            var dict = {};

            for (var k = 0; k < csvData.headers.length; k++) {
                dict[csvData.headers[k]] = this._utils.trim(this._utils.safeGet(values, k, ""));
            }

            this._aiService.createClone(templateGroup, created, dict, csvData.referenceMap);
            created++;

            // Redraw định kỳ
            if (created % this._config.REDRAW_INTERVAL === 0) {
                app.redraw();
            }
        }

        return created;
    }
};

// ============================================================================
// COMPOSITION ROOT - Wire up all dependencies
// ============================================================================

// Initialize services with their dependencies
ClipboardService.init(Utils, CONFIG);
CSVService.init(Utils, CONFIG);
FontService.init(Utils);
AIService.init(FontService, Utils, CONFIG);
UIService.init(ClipboardService, FontService, Utils, CONFIG);

// Initialize App with all services
App.init(AIService, CSVService, UIService, Utils, CONFIG);

// Run the application
App.run();

