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
