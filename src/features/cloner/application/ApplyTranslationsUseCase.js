/**
 * @class ApplyTranslationsUseCase
 * @description Use Case điều phối việc clone selection và apply translations.
 * Đây là Application layer - không chứa logic trực tiếp với Adobe API.
 */
var ApplyTranslationsUseCase = {
    /** @type {ILayerRepository} */
    layerRepository: null,

    /**
     * Khởi tạo UseCase với repository dependencies
     * @param {ILayerRepository} layerRepository
     * @returns {ApplyTranslationsUseCase}
     */
    init: function (layerRepository) {
        this.layerRepository = layerRepository;
        return this;
    },

    /**
     * Thực thi use case: Clone và apply translations cho nhiều ngôn ngữ
     * @param {Array} originalTextItems - Danh sách text items gốc { id, text }
     * @param {Array} targetCols - Cấu hình các cột đích { langCode, translations, fontName }
     * @returns {boolean} true nếu thành công
     */
    execute: function (originalTextItems, targetCols) {
        // 1. Validate inputs
        if (!targetCols || targetCols.length === 0) {
            return false;
        }

        if (!this.layerRepository) {
            throw new Error("LayerRepository not initialized in ApplyTranslationsUseCase");
        }

        // 2. Group selection thành template
        var templateInfo = this.layerRepository.groupSelection();
        if (!templateInfo || !templateInfo.group) {
            return false;
        }

        // 3. Tạo CloneConfig
        var config = new CloneConfig(
            10, // Margin giữa các clones (reduced từ 20 xuống 10)
            templateInfo.position,
            templateInfo.height
        );

        // 4. Process từng ngôn ngữ đích
        for (var i = 0; i < targetCols.length; i++) {
            var colConfig = targetCols[i];

            // Filter out unchecked items
            var activeTextItems = [];
            for (var k = 0; k < originalTextItems.length; k++) {
                if (originalTextItems[k].isIncluded !== false) {
                    activeTextItems.push(originalTextItems[k]);
                }
            }

            // A. Duplicate và position
            var clone = this.layerRepository.duplicateAndPosition(
                templateInfo.group,
                config,
                i,
                colConfig.langCode
            );

            // B. Thay thế text và apply font
            // Only pass active items so others are skipped/ignored during replacement traversal
            this.layerRepository.syncTraverseAndReplace(
                templateInfo.group,
                clone,
                activeTextItems,
                colConfig.translations,
                colConfig.fontName
            );
        }

        // 5. Finalize
        this.layerRepository.finalize(templateInfo.group);

        return true;
    }
};
