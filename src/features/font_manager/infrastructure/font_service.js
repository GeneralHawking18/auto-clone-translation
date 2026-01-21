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
