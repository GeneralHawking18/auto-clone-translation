/**
 * @file host_app.jsx
 * @description Main Entry Point for the Illustrator Translation Client.
 * Note: In production, all these files would be bundled into one .jsx file.
 */

// --- Includes (Manual Dependency Injection for Development) ---
// Note: Relative paths in #include are tricky in some AI versions. 
// Assuming this file is run from the Client root.

// 1. Shared / Utils
// #include "core/config.js"

// 2. Feature: Extractor
// #include "features/extractor/domain/TextItem.js"
// #include "features/extractor/infrastructure/AdobeSelectionRepository.js"
// #include "features/extractor/application/ExtractSelectedTextUseCase.js"
// #include "features/extractor/presentation/TextListView.js"

// 3. Feature: Cloner
// #include "features/cloner/infrastructure/AdobeLayerService.js"

// 4. Feature: Translator
// #include "features/translator/infrastructure/PythonBackendAdapter.js"
// #include "features/translator/application/SubmitTranslationUseCase.js"
// #include "features/translator/presentation/MainTranslatorDialog.js"


// --- Main Execution Block ---
(function () {
    try {
        // 1. Setup Dependencies
        // Extractor
        ExtractSelectedTextUseCase.init(AdobeSelectionRepository);

        // Utils
        // AppUtils is global

        // Font Manager
        FontService.init(AppUtils);
        FontDiscoveryUseCase.init(FontService);

        // Cloner (Clean Architecture Refactor)
        // AdobeLayerRepository is stateless infra
        // ClonerController wires everything
        var clonerController = ClonerController.init();

        // Translator
        // Initialize UseCase with BackendAdapter and ClonerController
        SubmitTranslationUseCase.init(PythonBackendAdapter, clonerController);
        MainTranslatorDialog.init(SubmitTranslationUseCase);

        // 2. Run Flow
        // Step A: Extract Text
        var textItems = ExtractSelectedTextUseCase.execute();

        if (textItems.length === 0) {
            alert("No text found in selection! Please select objects containing text.");
            return;
        }

        // Step B: Get Fonts
        var fontList = FontDiscoveryUseCase.execute();

        // Step C: Show UI
        MainTranslatorDialog.show(textItems, fontList);

    } catch (e) {
        alert("System Error: " + e.message + "\nLine: " + e.line);
    }
})();
