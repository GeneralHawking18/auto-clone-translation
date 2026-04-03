/**
 * @class LanguageConstants
 * @description Defines supported languages and helper methods.
 */
var LanguageConstants = (function () {
    var SUPPORTED_LANGUAGES = [
        { code: 'vi', name: 'Vietnamese', label: 'Vietnamese (VI)' },
        { code: 'en', name: 'English', label: 'English (EN)' },
        { code: 'ja', name: 'Japanese', label: 'Japanese (JA)' },
        { code: 'tw', name: 'Traditional Chinese (TW)', label: 'Chinese TW (TW)' },
        { code: 'zh-tw', name: 'Traditional Chinese', label: 'Chinese TW (zh-TW)' },
        { code: 'hk', name: 'Traditional Chinese (HK)', label: 'Chinese HK (HK)' },
        { code: 'zh-hk', name: 'Traditional Chinese (HK)', label: 'Chinese HK (zh-HK)' },
        { code: 'cn', name: 'Simplified Chinese', label: 'Chinese CN (CN)' },
        { code: 'zh-cn', name: 'Simplified Chinese', label: 'Chinese CN (zh-CN)' },
        { code: 'th', name: 'Thai', label: 'Thai (TH)' },
        { code: 'ko', name: 'Korean', label: 'Korean (KO)' },
        { code: 'id', name: 'Indonesian', label: 'Indonesian (ID)' },
        { code: 'fr', name: 'French', label: 'French (FR)' },
        { code: 'de', name: 'German', label: 'German (DE)' },
        { code: 'es', name: 'Spanish', label: 'Spanish (ES)' },
        { code: 'pt', name: 'Portuguese', label: 'Portuguese (PT)' },
        { code: 'ru', name: 'Russian', label: 'Russian (RU)' },
        { code: 'uk', name: 'Ukrainian', label: 'Ukrainian (UK)' },
        { code: 'ar', name: 'Arabic', label: 'Arabic (AR)' },
        { code: 'tr', name: 'Turkish', label: 'Turkish (TR)' },
        { code: 'it', name: 'Italian', label: 'Italian (IT)' },
        { code: 'nl', name: 'Dutch', label: 'Dutch (NL)' },
        { code: 'pl', name: 'Polish', label: 'Polish (PL)' },
        { code: 'ms', name: 'Malay', label: 'Malay (MS)' }
    ];

    return {
        /**
         * Returns the full list of supported languages.
         * @returns {Array} List of language objects {code, name, label}
         */
        getList: function () {
            return SUPPORTED_LANGUAGES;
        },

        /**
         * Get language name by code (fallback to code if not found)
         */
        getName: function (code) {
            if (!code) return code;
            var lowerCode = code.replace(/"/g, "").toLowerCase();
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                if (SUPPORTED_LANGUAGES[i].code.toLowerCase() === lowerCode ||
                    SUPPORTED_LANGUAGES[i].name.toLowerCase() === lowerCode) {
                    return SUPPORTED_LANGUAGES[i].name;
                }
            }
            // Tra ve chinh code neu khong tim thay (khong fallback ve English)
            return code.toUpperCase();
        },

        /**
         * Get array of labels for Dropdown UI
         */
        getLabels: function () {
            var labels = [];
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                labels.push(SUPPORTED_LANGUAGES[i].label);
            }
            return labels;
        },

        /**
         * Get language object by index
         */
        getByIndex: function (index) {
            if (index < 0 || index >= SUPPORTED_LANGUAGES.length) return SUPPORTED_LANGUAGES[1]; // Default to English
            return SUPPORTED_LANGUAGES[index];
        },

        /**
         * Get index by code
         */
        getIndexByCode: function (code) {
            if (!code) return 0; // Default Vietnamese (index 0)
            var lowerCode = code.replace(/"/g, "").toLowerCase();
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                if (SUPPORTED_LANGUAGES[i].code.toLowerCase() === lowerCode ||
                    SUPPORTED_LANGUAGES[i].name.toLowerCase() === lowerCode) {
                    return i;
                }
            }
            // Khong tim thay: tra ve -1 de UI biet day la code la
            return -1;
        },

        /**
         * Get label string for a code - hien code goc neu khong co trong list
         */
        getLabelByCode: function (code) {
            if (!code) return 'Unknown';
            var lowerCode = code.replace(/"/g, "").toLowerCase();
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                if (SUPPORTED_LANGUAGES[i].code.toLowerCase() === lowerCode ||
                    SUPPORTED_LANGUAGES[i].name.toLowerCase() === lowerCode) {
                    return SUPPORTED_LANGUAGES[i].label;
                }
            }
            return code.toUpperCase() + ' (?)'; // Hien code goc
        }
    };
})();
