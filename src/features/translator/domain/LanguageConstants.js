/**
 * @class LanguageConstants
 * @description Defines supported languages and helper methods.
 */
var LanguageConstants = (function () {
    var SUPPORTED_LANGUAGES = [
        { code: 'vi', name: 'Vietnamese', label: 'Vietnamese (VN)' },
        { code: 'en', name: 'English', label: 'English (US)' }, // Using 'English' as generic or 'English (US)' based on user pref. Let's send 'English' to backend.
        { code: 'ja', name: 'Japanese', label: 'Japanese (JP)' },
        { code: 'zh-TW', name: 'Traditional Chinese', label: 'Traditional Chinese (TW)' },
        { code: 'zh-HK', name: 'Traditional Chinese (Hong Kong)', label: 'Chinese (Hong Kong)' },
        { code: 'th', name: 'Thai', label: 'Thai (TH)' },
        { code: 'ko', name: 'Korean', label: 'Korean (KR)' },
        { code: 'id', name: 'Indonesian', label: 'Indonesian (ID)' },
        { code: 'fr', name: 'French', label: 'French (FR)' },
        { code: 'de', name: 'German', label: 'German (DE)' },
        { code: 'uk', name: 'Ukrainian', label: 'Ukrainian (UA)' }
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
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                if (SUPPORTED_LANGUAGES[i].code === code) return SUPPORTED_LANGUAGES[i].name;
            }
            return code;
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
            for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
                if (SUPPORTED_LANGUAGES[i].code === code) return i;
            }
            return 1; // Default to English index
        }
    };
})();
