/**
 * @class TranslationTarget
 * @description Entity đại diện cho một ngôn ngữ đích cùng với các translations của nó.
 */
var TranslationTarget = function (langCode, translations, fontName) {
    this.langCode = langCode || 'en';
    this.translations = translations || {};
    this.fontName = fontName || null;
};

/**
 * Kiểm tra xem target có translation cho một ID cụ thể không
 * @param {string} id - ID của text item
 * @returns {boolean}
 */
TranslationTarget.prototype.hasTranslation = function (id) {
    return this.translations && this.translations[id] !== undefined;
};

/**
 * Lấy translation cho một ID
 * @param {string} id - ID của text item
 * @returns {string|null}
 */
TranslationTarget.prototype.getTranslation = function (id) {
    return this.hasTranslation(id) ? this.translations[id] : null;
};
