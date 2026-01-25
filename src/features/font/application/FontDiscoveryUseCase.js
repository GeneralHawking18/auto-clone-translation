/**
 * @class FontDiscoveryUseCase
 * @description Application Logic for discovering and filtering fonts.
 */
var FontDiscoveryUseCase = {
    fontService: null,

    /**
     * Initialize with dependencies
     * @param {Object} fontService 
     */
    init: function (fontService) {
        this.fontService = fontService;
        return this;
    },

    /**
     * Execute the use case to get a list of fonts.
     * @returns {Array<FontInfo>}
     */
    execute: function () {
        if (!this.fontService) {
            throw new Error("FontDiscoveryUseCase: Dependencies not initialized");
        }

        return this.fontService.getAllFonts();
    }
};