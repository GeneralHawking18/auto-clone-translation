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
