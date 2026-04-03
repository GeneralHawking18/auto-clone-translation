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

        // 2. Cache active document reference ONCE for the entire session.
        //    Avoids re-resolving app.activeDocument on every Adobe DOM operation.
        if (typeof this.layerRepository.setActiveDocument === 'function') {
            this.layerRepository.setActiveDocument(app.activeDocument);
        }

        // 3. Group selection thành template
        var templateInfo = this.layerRepository.groupSelection();
        if (!templateInfo || !templateInfo.group) {
            return false;
        }

        // 4. Tạo CloneConfig
        var config = new CloneConfig(
            10, // Margin giữa các clones
            templateInfo.position,
            templateInfo.height,
            templateInfo.artboardRect // Pass artboard rect for layout calculation
        );

        // 5. Filter active items and build path map ONCE (O(N) vs O(N×L))
        var activeTextItems = [];
        for (var k = 0; k < originalTextItems.length; k++) {
            if (originalTextItems[k].isIncluded !== false) {
                activeTextItems.push(originalTextItems[k]);
            }
        }
        var textFramePaths = [];
        if (typeof this.layerRepository.buildTextFramePathMap === 'function') {
            textFramePaths = this.layerRepository.buildTextFramePathMap(templateInfo.group, activeTextItems);
        }

        // 6. Switch to Outline Mode BEFORE the clone loop.
        //    This suppresses render overhead during batch DOM writes.
        //    NOTE: No redraw is triggered here — the single redraw happens in finalize().
        if (typeof this.layerRepository.toggleOutlineMode === 'function') {
            this.layerRepository.toggleOutlineMode();
        }

        // 7. Process each target language
        for (var i = 0; i < targetCols.length; i++) {
            var colConfig = targetCols[i];

            // A. Duplicate template and position on new artboard
            var artboardName = colConfig.namePicture || colConfig.langCode;
            var clone = this.layerRepository.duplicateAndPosition(
                templateInfo.group,
                config,
                i,
                artboardName
            );

            // B. Apply translations + fonts via cached path map (fast O(1) navigation)
            if (this.layerRepository.applyTranslationsByPath) {
                this.layerRepository.applyTranslationsByPath(
                    clone,
                    textFramePaths,
                    colConfig.translations,
                    colConfig.fontName,
                    colConfig.fontAppliedMap || {}
                );
            } else {
                // Fallback: legacy traverse-and-replace
                this.layerRepository.syncTraverseAndReplace(
                    templateInfo.group,
                    clone,
                    activeTextItems,
                    colConfig.translations,
                    colConfig.fontName,
                    colConfig.fontAppliedMap || {}
                );
            }
        }

        // 8. Restore Preview Mode
        if (typeof this.layerRepository.toggleOutlineMode === 'function') {
            this.layerRepository.toggleOutlineMode();
        }

        // 9. Finalize — deselect/ungroup template and trigger the SINGLE app.redraw()
        //    for the entire session. All prior steps ran with rendering suppressed.
        this.layerRepository.finalize(templateInfo.group, templateInfo.wasGroupedByCommand);

        return true;
    }
};
