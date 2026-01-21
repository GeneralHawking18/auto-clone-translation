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
