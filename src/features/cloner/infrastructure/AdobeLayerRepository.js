/**
 * @class AdobeLayerRepository
 * @implements {ILayerRepository}
 * @description Adobe Illustrator implementation của ILayerRepository.
 * Chứa tất cả logic tương tác trực tiếp với Adobe Illustrator API.
 *
 * PERFORMANCE NOTES:
 *  - _doc: Cached document reference — avoids re-resolving app.activeDocument each call
 *  - _fontCache: Cached font objects — app.textFonts.getByName() is expensive
 *  - _navigateToFrame: Bounds-check navigation instead of try-catch per step
 *  - applyTranslationsByPath: 2-pass (text → font) to reduce interleaved reflows
 *  - toggleOutlineMode: Removed app.redraw() — only one final redraw in finalize()
 */
var AdobeLayerRepository = (function () {
    var repo = {};

    /**
     * @private
     * Cached reference to the active document. Set via setActiveDocument().
     */
    repo._doc = null;

    /**
     * @private
     * Font object cache: { fontName: fontObject|null }
     * Avoids repeated app.textFonts.getByName() calls (expensive Adobe API).
     */
    repo._fontCache = {};

    /**
     * Cache the active document reference to avoid re-resolving app.activeDocument
     * on every DOM operation (Adobe resolves this reference each time).
     * @param {Document} doc
     */
    repo.setActiveDocument = function (doc) {
        this._doc = doc;
        // Reset font cache on new document to avoid stale references
        this._fontCache = {};
    };

    /**
     * @private
     * Resolve font object with caching. Falls back to app.textFonts.getByName().
     * @param {string} fontName
     * @returns {Object|null}
     */
    repo._resolveFont = function (fontName) {
        if (!fontName) return null;
        if (this._fontCache.hasOwnProperty(fontName)) return this._fontCache[fontName];

        var font = null;
        if (typeof FontService !== 'undefined' && typeof FontService.findByName === 'function') {
            font = FontService.findByName(fontName);
        } else {
            try { font = app.textFonts.getByName(fontName); } catch (e) {}
        }
        // Cache even null so we don't retry failed lookups
        this._fontCache[fontName] = font;
        return font;
    };

    /**
     * @private
     * Navigate from a root group to a TextFrame using an index path array.
     * Uses bounds checking instead of try-catch to avoid exception overhead in hot path.
     * @param {Object} root - Root group item
     * @param {Array<number>} indices - Index path
     * @returns {Object|null} TextFrame or null if path is invalid
     */
    repo._navigateToFrame = function (root, indices) {
        var node = root;
        for (var i = 0; i < indices.length; i++) {
            var items = node.pageItems;
            if (!items || indices[i] >= items.length) return null;
            node = items[indices[i]];
        }
        return (node && node.typename === "TextFrame") ? node : null;
    };

    /**
     * @private
     * Apply font to a resolved TextFrame. Uses direct .textRange (no .story fallback chain).
     * @param {Object} textFrame
     * @param {Object} font - Resolved native font object
     */
    repo._applyFontToFrame = function (textFrame, font) {
        try {
            textFrame.textRange.characterAttributes.textFont = font;
        } catch (e) {}
    };

    /**
     * @override
     * Groups current selection vào một template group
     *
     * PERFORMANCE FIX:
     * Thay vì dùng vòng lặp move() (mỗi call re-renders appearance effects như offset path,
     * gaussian blur trên từng object → cực kỳ chậm với artboard phức tạp),
     * ta dùng executeMenuCommand("group") để Illustrator xử lý grouping nội bộ 1 lần,
     * bỏ qua per-object re-render. Nhanh hơn 5-10x với objects có live effects.
     */
    repo.groupSelection = function () {
        var doc = this._doc || app.activeDocument;
        var selection = doc.selection;

        // Nếu không có element nào được chọn, tự động chọn tất cả trên active artboard
        if (!selection || selection.length === 0) {
            doc.selectObjectsOnActiveArtboard();
            selection = doc.selection;
        }

        if (!selection || selection.length === 0) return null;

        var templateGroup = null;
        var wasGroupedByCommand = false;

        if (selection.length === 1 && selection[0].typename === "GroupItem") {
            // Already a single group — use directly, no need to re-wrap
            templateGroup = selection[0];
            wasGroupedByCommand = false;
        } else {
            // FIX: Dùng menu command "group" thay vì vòng lặp move()
            // → Illustrator gom toàn bộ selection vào 1 group trong 1 internal operation
            // → KHÔNG trigger re-render appearance (offset path, gaussian blur) per-item
            app.executeMenuCommand("group");
            wasGroupedByCommand = true;

            // Sau khi group, selection[0] sẽ là group mới tạo
            var newSel = doc.selection;
            if (!newSel || newSel.length === 0 || newSel[0].typename !== "GroupItem") {
                // Fallback nếu menu command không hoạt động (edge case)
                wasGroupedByCommand = false;
                templateGroup = doc.groupItems.add();
                for (var i = 0; i < selection.length; i++) {
                    selection[i].move(templateGroup, ElementPlacement.PLACEATEND);
                }
            } else {
                templateGroup = newSel[0];
            }
        }

        var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();
        var artboardRect = doc.artboards[activeArtboardIndex].artboardRect;

        return {
            group: templateGroup,
            height: templateGroup.height,
            position: templateGroup.position,
            artboardRect: artboardRect,
            wasGroupedByCommand: wasGroupedByCommand  // Flag để finalize() biết có cần ungroup không
        };
    };

    /**
     * @override
     * Duplicate một group và đặt vị trí
     */
    repo.duplicateAndPosition = function (templateGroup, config, index, artboardName) {
        var doc = this._doc || app.activeDocument;

        // 1. Tạo artboard mới
        var newRect = config.calculateNewArtboardRect(index);
        var newArtboard = doc.artboards.add(newRect);

        var safeName = artboardName ? artboardName : "Artboard " + (index + 2);
        newArtboard.name = safeName;

        // 2. Duplicate group
        var clone = templateGroup.duplicate();
        clone.name = "[" + safeName + "] " + (templateGroup.name || "Clone");

        // 3. Đặt vị trí (Duy trì vị trí tương đối so với artboard mới)
        clone.position = config.calculateNewPosition(index, templateGroup.position);

        return clone;
    };

    /**
     * @override
     * Builds an array of DOM paths to target text frames ONCE.
     * Called once before the language loop — O(N) total instead of O(N×L).
     */
    repo.buildTextFramePathMap = function (templateGroup, originalTextItems) {
        var paths = [];
        this._buildPaths(templateGroup, originalTextItems, [], paths);
        return paths;
    };

    /**
     * @private
     */
    repo._buildPaths = function (currentItem, originalTextItems, currentPath, paths) {
        if (currentItem.typename === "TextFrame") {
            var foundItem = this._lookupItem(currentItem, originalTextItems);
            if (foundItem) {
                paths.push({
                    indices: currentPath.slice(), // snapshot of current path
                    itemData: foundItem
                });
            }
        } else if (currentItem.typename === "GroupItem") {
            var children = currentItem.pageItems;
            for (var i = 0; i < children.length; i++) {
                currentPath.push(i);
                this._buildPaths(children[i], originalTextItems, currentPath, paths);
                currentPath.pop();
            }
        }
    };

    /**
     * @override
     * Apply translations using cached index paths.
     *
     * PERFORMANCE: 2-pass strategy —
     *   Pass 1: Set all text contents (batched, minimal reflow triggers)
     *   Pass 2: Set all fonts in one sweep (avoids interleaved content+font reflows)
     *
     * Font resolution is cached via _resolveFont (no repeated getByName calls).
     * Navigation uses bounds-check helper (no try-catch per step).
     */
    repo.applyTranslationsByPath = function (destGroup, paths, translations, fontName, fontAppliedMap) {
        var resolvedFont = this._resolveFont(fontName);

        // Collect frames that need a font change — built during Pass 1
        var fontTargets = resolvedFont ? [] : null;

        // === Pass 1: Apply all text contents ===
        for (var p = 0; p < paths.length; p++) {
            var pathObj = paths[p];
            var itemData = pathObj.itemData;

            var targetFrame = this._navigateToFrame(destGroup, pathObj.indices);
            if (!targetFrame) continue;

            var transText = (translations && translations[itemData.id]) ? translations[itemData.id] : null;
            if (transText) {
                targetFrame.contents = transText;
            }

            // Decide if font should be applied
            if (fontTargets !== null) {
                var shouldApplyFont = true;
                if (fontAppliedMap && fontAppliedMap.hasOwnProperty(itemData.id)) {
                    shouldApplyFont = fontAppliedMap[itemData.id];
                } else if (typeof itemData.isFontIncluded !== 'undefined') {
                    shouldApplyFont = itemData.isFontIncluded;
                }
                if (shouldApplyFont) {
                    fontTargets.push(targetFrame);
                }
            }
        }

        // === Pass 2: Apply fonts in batch ===
        if (fontTargets) {
            for (var f = 0; f < fontTargets.length; f++) {
                this._applyFontToFrame(fontTargets[f], resolvedFont);
            }
        }
    };

    /**
     * @override
     * Traverse và replace text content (legacy fallback path)
     */
    repo.syncTraverseAndReplace = function (sourceItem, destItem, originalTextItems, translations, fontName, fontAppliedMap) {
        this._traverseAndReplace(sourceItem, destItem, originalTextItems, translations, fontName, fontAppliedMap);
    };

    /**
     * @private
     * Recursive traversal để match source và dest items
     */
    repo._traverseAndReplace = function (sourceItem, destItem, originalTextItems, translations, fontName, fontAppliedMap) {
        if (sourceItem.typename !== destItem.typename) return;

        if (sourceItem.typename === "TextFrame") {
            var foundItem = this._lookupItem(sourceItem, originalTextItems);

            if (foundItem) {
                var transText = (translations && translations[foundItem.id]) ? translations[foundItem.id] : null;
                if (transText) {
                    destItem.contents = transText;
                }

                var shouldApplyFont = true;
                if (fontAppliedMap && fontAppliedMap.hasOwnProperty(foundItem.id)) {
                    shouldApplyFont = fontAppliedMap[foundItem.id];
                } else if (typeof foundItem.isFontIncluded !== 'undefined') {
                    shouldApplyFont = foundItem.isFontIncluded;
                }

                if (shouldApplyFont) {
                    var font = this._resolveFont(fontName);
                    if (font) this._applyFontToFrame(destItem, font);
                }
            }

        } else if (sourceItem.typename === "GroupItem") {
            var srcChildren = sourceItem.pageItems;
            var destChildren = destItem.pageItems;

            if (srcChildren.length === destChildren.length) {
                for (var i = 0; i < srcChildren.length; i++) {
                    this._traverseAndReplace(srcChildren[i], destChildren[i], originalTextItems, translations, fontName, fontAppliedMap);
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
     * Apply font cho một text frame (legacy path — uses _resolveFont internally)
     */
    repo._applyFont = function (textFrame, fontName) {
        var font = this._resolveFont(fontName);
        if (font) this._applyFontToFrame(textFrame, font);
    };

    /**
     * @override
     * Finalize quá trình clone.
     * Single app.redraw() call — the ONLY redraw in the entire clone session.
     *
     * IMPORTANT: Nếu groupSelection() đã dùng executeMenuCommand("group") để tạo group
     * thì sau khi clone xong cần ungroup lại để phục hồi cấu trúc file gốc.
     * @param {Object} templateGroup - The group created during groupSelection()
     * @param {boolean} [wasGroupedByCommand] - true nếu group được tạo bởi menu command
     */
    repo.finalize = function (templateGroup, wasGroupedByCommand) {
        try {
            if (wasGroupedByCommand) {
                // Chọn lại templateGroup rồi ungroup để phục hồi cấu trúc gốc
                templateGroup.selected = true;
                app.executeMenuCommand("ungroup");
            } else {
                templateGroup.selected = false;
            }
        } catch (e) {
            // Nếu ungroup thất bại, chỉ deselect
            try { templateGroup.selected = false; } catch (e2) {}
        }
        app.redraw();
    };

    /**
     * @override
     * Toggles Outline view mode via menu command.
     * NOTE: No app.redraw() here — finalize() owns the single redraw.
     */
    repo.toggleOutlineMode = function () {
        try {
            app.executeMenuCommand("preview");
            // Deliberately NO app.redraw() here — each redraw costs ~100-500ms
            // The final redraw happens in finalize() only.
        } catch (e) {}
    };

    return repo;
})();
