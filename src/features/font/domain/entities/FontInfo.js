/**
 * @entity FontInfo
 * @description Domain Entity representing a Font.
 */
var FontInfo = {
    /**
     * Factory method to create a FontInfo object
     * @param {string} name - PostScript name (unique identifier)
     * @param {string} family - Font Family (e.g., Arial)
     * @param {string} style - Font Style (e.g., Bold)
     * @returns {Object}
     */
    create: function (name, family, style) {
        return {
            name: name,
            family: family,
            style: style,
            displayName: family + " - " + style
        };
    }
};