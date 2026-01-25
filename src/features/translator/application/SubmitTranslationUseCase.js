/**
 * @class SubmitTranslationUseCase
 * @description Coordinates the Translation process.
 * Acts as the Delegate for MainTranslatorDialog.
 */
var SubmitTranslationUseCase = {
    backendAdapter: null,
    clonerController: null,

    init: function (backendAdapter, clonerController) {
        this.backendAdapter = backendAdapter;
        this.clonerController = clonerController;
        return this;
    },

    /**
     * Called when User clicks "Finish (Clone)" in the UI.
     * @param {Array} textItems - Original text items
     * @param {Array} targetCols - Configuration columns with translations
     */
    onFinish: function (textItems, targetCols) {
        if (!this.clonerController) {
            alert("Error: ClonerController not initialized.");
            return;
        }

        try {
            // Updated to use ClonerController (Clean Architecture)
            this.clonerController.applyTranslations(textItems, targetCols);

            // Success Message
            var totalLangs = targetCols.length;
            alert("Success! Created clones for " + totalLangs + " language(s).");

        } catch (e) {
            alert("Error during cloning: " + e.message);
        }
    },

    /**
     * Executes batch translation via Backend Adapter
     * @param {Array} textItems - Items to translate
     * @param {string} sourceLang - Source language code
     * @param {string} targetLang - Target language code
     * @returns {Object} Translation map { id: translatedText }
     */
    translateBatch: function (textItems, sourceLang, targetLang) {
        if (!this.backendAdapter) {
            throw new Error("Backend Adapter not initialized");
        }

        // Prepare job
        var job = {
            items: textItems,
            sourceLang: sourceLang,
            targetLang: targetLang
        };

        // Call API
        var response = this.backendAdapter.translate(job);

        // Parse response (New Schema: { translations: [ {id, text} ] })
        var map = {};
        if (response && response.translations) {
            var inputIds = {}; // Helper to track original text if needed, but we rely on ID
            for (var i = 0; i < response.translations.length; i++) {
                var item = response.translations[i];
                if (item.id && item.text) {
                    map[item.id] = item.text;
                }
            }
        }

        return map;
    }
};