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
