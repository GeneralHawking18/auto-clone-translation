const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_FILE = path.join(DIST_DIR, 'AutoCloneTranslate.jsx');

// Order is important!
const FILES = [
    // Utils & Core
    'utils/json2.js',
    'utils/AppUtils.js',

    // Feature: Extractor
    'features/extractor/domain/TextItem.js',
    'features/extractor/infrastructure/AdobeSelectionRepository.js',
    'features/extractor/application/ExtractSelectedTextUseCase.js',
    'features/extractor/presentation/TextListView.js',

    // Feature: Font Manager
    'features/font/domain/entities/FontInfo.js',
    'features/font/infrastructure/FontService.js',
    'features/font/application/FontDiscoveryUseCase.js',
    'features/font/presentation/FontSearchDialog.js',
    'features/font/presentation/FontSelectorView.js',

    // Feature: Cloner (Clean Architecture)
    'features/cloner/domain/CloneConfig.js',
    'features/cloner/domain/TranslationTarget.js',
    'features/cloner/domain/ILayerRepository.js',
    'features/cloner/infrastructure/AdobeLayerRepository.js',
    'features/cloner/application/ApplyTranslationsUseCase.js',
    'features/cloner/presentation/ClonerController.js',

    // Feature: Translator
    'features/translator/domain/LanguageConstants.js',
    'features/translator/infrastructure/PythonBackendAdapter.js',
    'features/translator/application/SubmitTranslationUseCase.js',
    'features/translator/presentation/MainTranslatorDialog.js',

    // App Entry
    'host_app.jsx'
];

function bundle() {
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
    }

    let content = "/** Auto-Generated Build - Do Not Edit */\n\n";

    FILES.forEach(file => {
        const filePath = path.join(SOURCE_DIR, file);
        if (fs.existsSync(filePath)) {
            console.log(`Bundling: ${file}`);
            const text = fs.readFileSync(filePath, 'utf8');
            // Basic cleanup: remove #include lines as we interpret them differently here
            const cleanText = text.replace(/^\/\/\s*#include.*$/gm, '// included by build');
            content += `\n/* --- ${file} --- */\n`;
            content += cleanText + "\n";
        } else {
            console.error(`Missing file: ${filePath}`);
        }
    });

    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log(`Build Complete: ${OUTPUT_FILE}`);
}

bundle();
