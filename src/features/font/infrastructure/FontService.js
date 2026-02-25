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
    },

    /**
     * Calculates default fonts for the given target columns based on selected text items.
     * Initializes per-column fontAppliedMap based on ideographic checks.
     * Uses NotoSans if ideographic characters are present, fallback to Arial/Original.
     * 
     * @param {Array<TextItem>} textItems - The list of text items to process.
     * @param {Array<Object>} targetCols - The target language columns configuration.
     */
    applyDefaultFontsToTargets: function (textItems, targetCols) {
        var defaultOriginalFontName = null;
        var cjkRegex = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;

        // We process font defaults per target column because some columns may need CJK fonts while others don't.
        for (var c = 0; c < targetCols.length; c++) {
            var colHasIdeographic = false;

            if (!targetCols[c].fontAppliedMap) {
                targetCols[c].fontAppliedMap = {};
            }

            for (var i = 0; i < textItems.length; i++) {
                var item = textItems[i];

                if (!defaultOriginalFontName && item.originalFontName) {
                    defaultOriginalFontName = item.originalFontName;
                }

                if (item.isIncluded) {
                    // Check if original text OR translated text for this specific column is ideographic
                    var isSourceIdeographic = !!item.isIdeographic;
                    var transVal = targetCols[c].translations ? targetCols[c].translations[item.id] : "";
                    var isTargetIdeographic = transVal ? cjkRegex.test(transVal) : false;
                    var itemNeedsCJKFont = isSourceIdeographic || isTargetIdeographic;

                    if (itemNeedsCJKFont) {
                        colHasIdeographic = true;
                    }

                    if (typeof targetCols[c].fontAppliedMap[item.id] === 'undefined') {
                        targetCols[c].fontAppliedMap[item.id] = itemNeedsCJKFont;
                    }
                }
            }

            var fontToApply = defaultOriginalFontName;

            if (colHasIdeographic) {
                var notoSansMatch = this._findBestNotoSansMatch();
                if (notoSansMatch) {
                    fontToApply = notoSansMatch;
                }
            }

            if (fontToApply && !targetCols[c].fontName) {
                targetCols[c].fontName = fontToApply;
            }
        }
    },

    /**
     * Helper to find the best match for NotoSans in the available system fonts.
     * @private
     * @returns {string|null} The best font name or null if none found.
     */
    _findBestNotoSansMatch: function () {
        var fonts = this.getAllFonts();
        if (!fonts || fonts.length === 0) return null;

        var notoSansName = null;
        var hasNotoSans = false;

        // Try to find a NotoSans font, preferring Regular
        for (var f = 0; f < fonts.length; f++) {
            if (fonts[f].name.indexOf("NotoSans") > -1) {
                notoSansName = fonts[f].name;
                hasNotoSans = true;
                if (notoSansName.indexOf("Regular") > -1) break; // Found optimal default
            }
        }

        if (hasNotoSans) {
            return notoSansName;
        }

        // Fallback to searching just "Noto" if "NotoSans" isn't found
        for (var f2 = 0; f2 < fonts.length; f2++) {
            if (fonts[f2].name.indexOf("Noto") > -1) {
                return fonts[f2].name;
            }
        }

        return null;
    }
};
