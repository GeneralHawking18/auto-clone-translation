const fs = require('fs');
const path = require('path');

// Adjusted paths for Build Script in /scripts/ folder
const SRC_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_FILE = path.join(DIST_DIR, 'AutoFillFromSheet.jsx');

// Ensure dist folder exists
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Define the exact order of files (Relative to SRC_DIR)
// Order: Core → Domain → Application → Infrastructure → Presentation → Main
const FILES = [
    // 1. Core
    'core/config/config.js',
    'core/utils/common_utils.js',

    // 2. Domain (Entities)
    'features/data_import/domain/entities/csv_row.js',
    'features/font_manager/domain/entities/font_info.js',
    'features/template_engine/domain/entities/template_group.js',

    // 3. Application (Interfaces)
    'features/data_import/application/interfaces/data_reader.js',
    'features/font_manager/application/interfaces/font_repository.js',
    'features/template_engine/application/interfaces/template_service.js',

    // 4. Infrastructure (Implementations)
    'features/data_import/infrastructure/clipboard_service.js',
    'features/data_import/infrastructure/csv_service.js',
    'features/font_manager/infrastructure/font_service.js',
    'features/template_engine/infrastructure/ai_service.js',

    // 5. Presentation
    'features/ui/presentation/main_dialog.js',

    // 6. Main Entry
    'main.jsx'
];

function build() {
    console.log('🚀 Starting Build Process...');
    let content = '// Auto-Generated File via build.js\n// DO NOT EDIT DIRECTLY\n\n';

    FILES.forEach(relativePath => {
        const fullPath = path.join(SRC_DIR, relativePath);
        if (fs.existsSync(fullPath)) {
            console.log(`   + Included: ${relativePath}`);
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            content += `\n// ==========================================\n// FILE: ${relativePath}\n// ==========================================\n`;
            content += fileContent + '\n';
        } else {
            console.warn(`   ⚠️  WARNING: File not found: ${relativePath}`);
            content += `\n// MISSING FILE: ${relativePath}\n`;
        }
    });

    try {
        fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
        console.log(`\n✅ Build Success! Output: ${OUTPUT_FILE}`);
        console.log(`   Size: ${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(2)} KB`);
    } catch (e) {
        console.error('\n❌ Build Failed:', e.message);
        process.exit(1);
    }
}

build();
