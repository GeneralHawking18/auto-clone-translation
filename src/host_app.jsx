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
// #include "shared/presentation/ui/VirtualSlotGrid.js"

// 2. Feature: Extractor
// #include "features/extractor/domain/TextItem.js"
// #include "features/extractor/infrastructure/AdobeSelectionRepository.js"
// #include "features/extractor/application/ExtractSelectedTextUseCase.js"
// #include "features/extractor/presentation/TextListView.js"

// 3. Feature: Cloner
// #include "features/cloner/infrastructure/AdobeLayerService.js"

// 4. Feature: Translator
// #include "features/translator/infrastructure/PythonBackendAdapter.js"
// #include "features/translator/infrastructure/MockBackendAdapter.js"
// #include "features/translator/infrastructure/GoogleSheetAdapter.js"
// #include "features/translator/application/SubmitTranslationUseCase.js"
// #include "features/translator/application/PullSheetAndTranslateUseCase.js"
// #include "features/translator/presentation/MainTranslatorDialog.js"


// --- Main Execution Block ---
(function () {
    try {
        // 1. Setup Dependencies
        // Extractor
        ExtractSelectedTextUseCase.init(AdobeSelectionRepository);

        // Font Manager
        FontService.init(AppUtils);
        FontDiscoveryUseCase.init(FontService);

        // Cloner
        var clonerUseCase = ApplyTranslationsUseCase.init(AdobeLayerRepository);

        // Translator
        PythonBackendAdapter.init();
        GoogleSheetAdapter.init();
        PullSheetAndTranslateUseCase.init(GoogleSheetAdapter, PythonBackendAdapter);

        // 2. Run Flow via Coordinator
        var appCoordinator = MainAppCoordinator.init({
            extractUseCase: ExtractSelectedTextUseCase,
            fontUseCase: FontDiscoveryUseCase,
            pullTranslationUseCase: PullSheetAndTranslateUseCase,
            cloneUseCase: clonerUseCase
        });

        appCoordinator.start();

    } catch (e) {
        alert("System Error: " + e.message + "\nLine: " + e.line);
    }
})();
