/**
 * Module xử lý các thao tác với Illustrator
 * @namespace
 */
var AIService = {
    // Dependencies (injected via init)
    _fontService: null,
    _utils: null,
    _config: null,

    /**
     * Khởi tạo service với dependencies
     * @param {Object} fontService - FontService module
     * @param {Object} utils - Utils module
     * @param {Object} config - CONFIG object
     */
    init: function (fontService, utils, config) {
        this._fontService = fontService;
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Lấy Group template đang được chọn
     * @returns {GroupItem} Group được chọn
     * @throws {Error} Nếu không có selection phù hợp
     */
    getSelectedTemplate: function () {
        if (app.documents.length === 0) {
            throw new Error(this._config.MESSAGES.NO_DOC);
        }

        var selection = app.activeDocument.selection;

        if (!selection || selection.length === 0) {
            throw new Error(this._config.MESSAGES.NO_SELECTION);
        }
        if (selection.length > 1) {
            throw new Error(this._config.MESSAGES.MULTI_SELECTION);
        }
        if (selection[0].typename !== "GroupItem") {
            throw new Error(this._config.MESSAGES.NOT_GROUP);
        }

        return selection[0];
    },

    /**
     * Lấy tất cả TextFrame trong container (đệ quy)
     * @param {PageItem} container - Container cần tìm
     * @param {Array} [result] - Mảng kết quả (dùng nội bộ)
     * @returns {Array<TextFrame>} Danh sách TextFrame
     */
    getAllTextFrames: function (container, result) {
        if (!result) result = [];

        for (var i = 0; i < container.pageItems.length; i++) {
            var item = container.pageItems[i];
            if (item.typename === "TextFrame") {
                result.push(item);
            } else if (item.typename === "GroupItem") {
                this.getAllTextFrames(item, result);
            }
        }

        return result;
    },

    /**
     * Tìm index của cột font trong headers
     * @param {Array<string>} headers - Danh sách headers
     * @returns {number} Index hoặc -1 nếu không tìm thấy
     * @private
     */
    _findFontColumnIndex: function (headers) {
        for (var h = 0; h < headers.length; h++) {
            if (headers[h] === this._config.MASTER_FONT_KEY) {
                return h;
            }
        }
        return -1;
    },

    /**
     * Phân tích và tạo báo cáo mapping
     * @param {GroupItem} group - Group template
     * @param {Array} headers - Headers
     * @param {Object} referenceMap - Map reference values
     * @param {Array} dataRows - Các dòng dữ liệu
     * @returns {Object} { text: string, count: number, hasMasterFont: boolean }
     */
    analyzeMapping: function (group, headers, referenceMap, dataRows) {
        var frames = this.getAllTextFrames(group);
        var fontColumnIndex = this._findFontColumnIndex(headers);
        var hasMasterFont = fontColumnIndex !== -1;

        // Tạo báo cáo text mapping
        var textReport = this._buildTextMappingReport(frames, headers, referenceMap);

        // Tạo báo cáo font
        var fontReport = this._buildFontReport(dataRows, fontColumnIndex, hasMasterFont);

        // Gộp báo cáo
        var report = textReport.lines.concat([""], fontReport.lines, ["", "═══════════════════════════════════════════"]);

        return {
            text: report.join("\n"),
            count: textReport.matchCount,
            hasMasterFont: hasMasterFont
        };
    },

    /**
     * Tạo báo cáo text mapping
     * @private
     */
    _buildTextMappingReport: function (frames, headers, referenceMap) {
        var report = [
            "═══════════════════════════════════════════",
            "📝 DANH SÁCH TEXT SẼ ĐƯỢC THAY THẾ:",
            "═══════════════════════════════════════════"
        ];
        var matchCount = 0;

        for (var i = 0; i < frames.length; i++) {
            var content = this._utils.trim(frames[i].contents);
            var contentNormalized = this._utils.normalizeForCompare(content);

            // Tìm header khớp với reference value
            for (var k = 0; k < headers.length; k++) {
                var refText = referenceMap[headers[k]];
                if (refText && contentNormalized === refText) {
                    report.push("  ✅ [" + headers[k].toUpperCase() + "] → '" + content + "'");
                    matchCount++;
                    break;
                }
            }
        }

        if (matchCount === 0) {
            report.push("  ❌ Không có text nào khớp!");
        }

        return { lines: report, matchCount: matchCount };
    },

    /**
     * Tạo báo cáo font
     * @private
     */
    _buildFontReport: function (dataRows, fontColumnIndex, hasMasterFont) {
        var report = [
            "═══════════════════════════════════════════",
            "🎨 DANH SÁCH FONT SẼ ĐƯỢC ÁP DỤNG:",
            "═══════════════════════════════════════════"
        ];

        if (!hasMasterFont) {
            report.push("  ⚠️ Không có cột '" + this._config.MASTER_FONT_KEY + "' trong data");
            report.push("  → Giữ nguyên font gốc của template");
            return { lines: report };
        }

        if (!dataRows || dataRows.length === 0) {
            report.push("  ⚠️ Không có dữ liệu");
            return { lines: report };
        }

        var fontAnalysis = this._fontService.analyzeRequired(dataRows, fontColumnIndex);
        var fontList = fontAnalysis.fontList;
        var fontStats = fontAnalysis.fontStats;

        if (fontList.length === 0) {
            report.push("  ⚠️ Cột 'font' trống - không đổi font");
            return { lines: report };
        }

        report.push("  📊 Tổng số font khác nhau: " + fontList.length);
        report.push("");

        // Liệt kê từng font
        for (var f = 0; f < fontList.length; f++) {
            var fn = fontList[f];
            var count = fontStats[fn];
            var fontInfo = this._fontService.checkExists(fn);

            var fontStatus = fontInfo.exists ? "✅" : "⚠️ (Không tìm thấy)";
            var displayText = "  " + fontStatus + " \"" + fn + "\"";

            if (fontInfo.exists && fontInfo.matchedName !== "" && fontInfo.matchedName !== fn) {
                displayText += " → sẽ dùng: \"" + fontInfo.matchedName + "\"";
            }
            displayText += " → " + count + " dòng";
            report.push(displayText);
        }

        // Preview dữ liệu
        report.push("");
        report.push("  📋 Preview dữ liệu (5 dòng đầu):");
        var previewCount = Math.min(5, dataRows.length);

        for (var p = 0; p < previewCount; p++) {
            var pFont = this._utils.trim(this._utils.safeGet(dataRows[p], fontColumnIndex, "(không có)"));
            report.push("     Dòng " + (p + 1) + ": " + pFont);
        }

        if (dataRows.length > 5) {
            report.push("     ... và " + (dataRows.length - 5) + " dòng nữa");
        }

        return { lines: report };
    },

    /**
     * Tạo bản clone từ template
     * @param {GroupItem} template - Template gốc
     * @param {number} rowIndex - Index của dòng dữ liệu
     * @param {Object} dataDict - Dictionary dữ liệu
     * @param {Object} referenceMap - Map reference values
     */
    createClone: function (template, rowIndex, dataDict, referenceMap) {
        var newGroup = template.duplicate();
        newGroup.name = "Row_" + (rowIndex + 1);

        // Đặt vị trí
        this._positionClonedGroup(newGroup, template, rowIndex);

        // Lấy font cho dòng này
        var rowFont = this._getRowFont(dataDict);

        // Thay thế nội dung text
        var frames = this.getAllTextFrames(newGroup);
        for (var i = 0; i < frames.length; i++) {
            this._processTextFrame(frames[i], dataDict, referenceMap, rowFont);
        }

        // Force refresh group
        this._nudgeElement(newGroup, 0.1);
    },

    /**
     * Đặt vị trí cho group đã clone
     * @private
     */
    _positionClonedGroup: function (newGroup, template, rowIndex) {
        var step = rowIndex + 1;
        var blockHeight = template.height + this._config.SPACING;
        newGroup.top = template.top - (blockHeight * step);
        newGroup.left = template.left;
    },

    /**
     * Lấy font cho dòng dữ liệu
     * @private
     */
    _getRowFont: function (dataDict) {
        if (!dataDict.hasOwnProperty(this._config.MASTER_FONT_KEY)) {
            return null;
        }

        var fontName = dataDict[this._config.MASTER_FONT_KEY];
        return this._fontService.findByName(fontName);
    },

    /**
     * Xử lý một TextFrame
     * @private
     */
    _processTextFrame: function (tf, dataDict, referenceMap, rowFont) {
        try {
            var content = this._utils.trim(tf.contents);
            var contentNormalized = this._utils.normalizeForCompare(content);

            // Tìm key phù hợp
            var matchedKey = null;
            for (var key in referenceMap) {
                if (referenceMap.hasOwnProperty(key) && referenceMap[key] === contentNormalized) {
                    matchedKey = key;
                    break;
                }
            }

            if (!matchedKey || !dataDict.hasOwnProperty(matchedKey)) {
                return;
            }

            // Lưu thuộc tính gốc
            var originalAttrs = this._saveTextAttributes(tf);

            // Thay nội dung
            tf.contents = dataDict[matchedKey];

            // Áp dụng font
            if (rowFont) {
                this._fontService.applyToTextFrame(tf, rowFont);
            }

            // Khôi phục thuộc tính
            this._restoreTextAttributes(tf, originalAttrs);

            // Nudge để refresh
            this._nudgeElement(tf, 0.01);

        } catch (e) { }
    },

    /**
     * Lưu các thuộc tính text
     * @private
     */
    _saveTextAttributes: function (tf) {
        var self = this;
        var attrs = {
            justification: null,
            size: null,
            tracking: null
        };

        this._utils.safeExecute(function () {
            attrs.justification = tf.paragraphs[0].paragraphAttributes.justification;
        });

        this._utils.safeExecute(function () {
            attrs.size = tf.textRange.characterAttributes.size;
            attrs.tracking = tf.textRange.characterAttributes.tracking;
        });

        return attrs;
    },

    /**
     * Khôi phục các thuộc tính text
     * @private
     */
    _restoreTextAttributes: function (tf, attrs) {
        if (attrs.justification !== null) {
            this._utils.safeExecute(function () {
                tf.paragraphs[0].paragraphAttributes.justification = attrs.justification;
            });
        }

        if (attrs.size !== null) {
            this._utils.safeExecute(function () {
                tf.textRange.characterAttributes.size = attrs.size;
            });
        }

        if (attrs.tracking !== null) {
            this._utils.safeExecute(function () {
                tf.textRange.characterAttributes.tracking = attrs.tracking;
            });
        }
    },

    /**
     * Nudge element để force refresh
     * @private
     */
    _nudgeElement: function (element, offset) {
        this._utils.safeExecute(function () {
            var originalLeft = element.left;
            var originalTop = element.top;
            element.left = originalLeft + offset;
            element.top = originalTop + offset;
            element.left = originalLeft;
            element.top = originalTop;
        });
    },

    /**
     * Force refresh màn hình
     */
    forceRefresh: function (templateGroup) {
        var self = this;
        // Redraw nhiều lần
        app.redraw();
        $.sleep(this._config.DELAYS.REFRESH);
        app.redraw();

        // Bỏ chọn rồi chọn lại
        app.activeDocument.selection = null;
        $.sleep(this._config.DELAYS.NUDGE);
        templateGroup.selected = true;
        $.sleep(this._config.DELAYS.NUDGE);
        app.activeDocument.selection = null;

        // Zoom trick
        this._utils.safeExecute(function () {
            var doc = app.activeDocument;
            var currentView = doc.views[0];
            var originalZoom = currentView.zoom;
            currentView.zoom = originalZoom * 1.01;
            app.redraw();
            $.sleep(self._config.DELAYS.NUDGE);
            currentView.zoom = originalZoom;
            app.redraw();
        });
    }
};
