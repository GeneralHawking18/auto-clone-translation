/**
 * @class ClonerController
 * @description Presentation layer controller - wires dependencies và expose API cho bên ngoài.
 */
var ClonerController = {
    /** @type {ApplyTranslationsUseCase} */
    useCase: null,

    /**
     * Khởi tạo controller với tất cả dependencies
     * @returns {ClonerController}
     */
    init: function () {
        // Wire dependencies theo Dependency Inversion
        this.useCase = ApplyTranslationsUseCase.init(AdobeLayerRepository);
        return this;
    },

    /**
     * API chính: Apply translations và clone selection
     * @param {Array} originalTextItems - Danh sách text items gốc
     * @param {Array} targetCols - Cấu hình các cột đích
     * @returns {boolean}
     */
    applyTranslations: function (originalTextItems, targetCols) {
        if (!this.useCase) {
            this.init();
        }
        return this.useCase.execute(originalTextItems, targetCols);
    }
};
