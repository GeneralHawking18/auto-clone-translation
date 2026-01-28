/**
 * @class AdobeLayerRepository
 * @implements {ILayerRepository}
 * @description Adobe Illustrator implementation của ILayerRepository.
 * Chứa tất cả logic tương tác trực tiếp với Adobe Illustrator API.
 */
var AdobeLayerRepository = (function () {
    // "Inherit" from ILayerRepository
    var repo = {};

    /**
     * @override
     * Groups current selection vào một template group
     */
    repo.groupSelection = function () {
        var doc = app.activeDocument;
        var selection = doc.selection;
        if (!selection || selection.length === 0) return null;

        var templateGroup = null;
        if (selection.length > 1) {
            templateGroup = doc.groupItems.add();
            for (var i = 0; i < selection.length; i++) {
                selection[i].move(templateGroup, ElementPlacement.PLACEATEND);
            }
        } else {
            if (selection[0].typename === "GroupItem") {
                templateGroup = selection[0];
            } else {
                templateGroup = doc.groupItems.add();
                selection[0].move(templateGroup, ElementPlacement.PLACEATEND);
            }
        }

        return {
            group: templateGroup,
            height: templateGroup.height,
            position: templateGroup.position
        };
    };

    /**
     * @override
     * Duplicate một group và đặt vị trí
     */
    repo.duplicateAndPosition = function (templateGroup, config, index, langCode) {
        var clone = templateGroup.duplicate();
        clone.name = "[" + langCode.toUpperCase() + "] " + (templateGroup.name || "Clone");

        var newTop = config.calculateNewTop(index);
        clone.position = [config.startLeft, newTop];
        clone.selected = true;

        app.redraw();
        return clone;
    };

    /**
     * @override
     * Traverse và replace text content
     */
    repo.syncTraverseAndReplace = function (sourceItem, destItem, originalTextItems, translations, fontName) {
        this._traverseAndReplace(sourceItem, destItem, originalTextItems, translations, fontName);
    };

    /**
     * @private
     * Recursive traversal để match source và dest items
     */
    repo._traverseAndReplace = function (sourceItem, destItem, originalTextItems, translations, fontName) {
        if (sourceItem.typename !== destItem.typename) return;

        if (sourceItem.typename === "TextFrame") {
            var foundItem = this._lookupItem(sourceItem, originalTextItems);

            if (foundItem) {
                // 1. Always apply translation if available
                var transText = (translations && translations[foundItem.id]) ? translations[foundItem.id] : null;
                if (transText) {
                    destItem.contents = transText;
                }

                // 2. Check if we should apply font (Default to true if undefined)
                var shouldApplyFont = (foundItem.isFontIncluded !== false);
                if (shouldApplyFont) {
                    this._applyFont(destItem, fontName);
                }
            }

        } else if (sourceItem.typename === "GroupItem") {
            var srcChildren = sourceItem.pageItems;
            var destChildren = destItem.pageItems;

            if (srcChildren.length === destChildren.length) {
                for (var i = 0; i < srcChildren.length; i++) {
                    this._traverseAndReplace(srcChildren[i], destChildren[i], originalTextItems, translations, fontName);
                }
            }
        }
    };

    /**
     * @private
     * Tìm text item gốc dựa trên nội dung text
     */
    repo._lookupItem = function (sourceItem, originalItems) {
        for (var i = 0; i < originalItems.length; i++) {
            if (originalItems[i].text === sourceItem.contents) {
                return originalItems[i];
            }
        }
        return null;
    };

    /**
     * @private
     * Apply font cho một text frame
     */
    repo._applyFont = function (textFrame, fontName) {
        if (!fontName) return;

        var font = null;
        if (typeof FontService !== 'undefined' && typeof FontService.findByName === 'function') {
            font = FontService.findByName(fontName);
        } else {
            try { font = app.textFonts.getByName(fontName); } catch (e) { }
        }

        if (font) {
            try {
                textFrame.story.textRange.characterAttributes.textFont = font;
            } catch (e) {
                try {
                    textFrame.textRange.characterAttributes.textFont = font;
                } catch (ex) { }
            }
        }
    };

    /**
     * @override
     * Finalize quá trình clone
     */
    repo.finalize = function (templateGroup) {
        templateGroup.selected = false;
        app.redraw();
    };

    return repo;
})();
