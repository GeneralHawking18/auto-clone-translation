/**
 * @interface ILayerRepository
 * @description Abstract interface định nghĩa contract cho các thao tác với layers.
 * Infrastructure implementations PHẢI implement tất cả các methods.
 */
var ILayerRepository = {
    /**
     * Groups current selection vào một template group
     * @returns {Object|null} Template group info { group, height, position } hoặc null nếu không có selection
     */
    groupSelection: function () {
        throw new Error("ILayerRepository.groupSelection() must be implemented");
    },

    /**
     * Duplicate một group và đặt vị trí dựa theo config
     * @param {Object} templateGroup - Group gốc
     * @param {CloneConfig} config - Cấu hình vị trí
     * @param {number} index - Index của clone (0-based)
     * @param {string} langCode - Mã ngôn ngữ để đặt tên
     * @returns {Object} Group đã được clone
     */
    duplicateAndPosition: function (templateGroup, config, index, langCode) {
        throw new Error("ILayerRepository.duplicateAndPosition() must be implemented");
    },

    /**
     * Thay thế nội dung text trong các items đã clone bằng translations
     * @param {Object} sourceItem - Item gốc
     * @param {Object} destItem - Item đã clone
     * @param {Array} originalTextItems - Danh sách text items gốc
     * @param {Object} translations - Map { id: translatedText }
     * @param {string} fontName - Font cần apply
     */
    syncTraverseAndReplace: function (sourceItem, destItem, originalTextItems, translations, fontName) {
        throw new Error("ILayerRepository.syncTraverseAndReplace() must be implemented");
    },

    /**
     * Hoàn tất quá trình clone (deselect template, redraw)
     * @param {Object} templateGroup - Template group
     */
    finalize: function (templateGroup) {
        throw new Error("ILayerRepository.finalize() must be implemented");
    }
};
