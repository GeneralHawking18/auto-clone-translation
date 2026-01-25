/**
 * @class FontService
 * @description Infrastructure service for accessing Illustrator's font system.
 * Implements IFontRepository interface (conceptually).
 */
var FontService = {
    _utils: null,
    _cache: null,

    /**
     * Initialize with dependencies
     * @param {Object} utils - AppUtils
     */
    init: function (utils) {
        this._utils = utils;
        this._cache = [];
        return this;
    },

    /**
     * Retrieve all available system fonts.
     * Uses caching to improve performance on subsequent calls.
     * @returns {Array<FontInfo>} List of FontInfo entities
     */
    getAllFonts: function () {
        if (this._cache && this._cache.length > 0) {
            return this._cache;
        }

        var fonts = [];
        // Illustrator's app.textFonts can be slow, so we iterate carefully
        try {
            var sysFonts = app.textFonts;
            var count = sysFonts.length;
            
            for (var i = 0; i < count; i++) {
                try {
                    var f = sysFonts[i];
                    // Create Domain Entity
                    var fontEntity = FontInfo.create(f.name, f.family, f.style);
                    fonts.push(fontEntity);
                } catch (e) {
                    // Skip broken fonts
                }
            }
        } catch (err) {
            if (this._utils) {
                this._utils.logError("FontService: Failed to load fonts. " + err.message);
            }
        }

        this._cache = fonts;
        return fonts;
    },

    /**
     * Force refresh the font cache
     */
    refreshCache: function () {
        this._cache = [];
        return this.getAllFonts();
    },

    /**
     * Find a font by its PostScript name (Exact Match)
     * @param {string} fontName 
     * @returns {Object|null} Font object (Illustrator native) or null
     */
    findByName: function (fontName) {
        if (!fontName) return null;
        try {
            return app.textFonts.getByName(fontName);
        } catch (e) {
            // Font not found
            return null;
        }
    },

    /**
     * Alias for findByName to support legacy calls if needed
     */
    getNativeFont: function (fontName) {
        return this.findByName(fontName);
    }
};
