/** Auto-Generated Build - Do Not Edit */


/* --- utils/json2.js --- */
if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                f(this.getUTCMonth() + 1) + "-" +
                f(this.getUTCDate()) + "T" +
                f(this.getUTCHours()) + ":" +
                f(this.getUTCMinutes()) + ":" +
                f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {
        var i;
        var k;
        var v;
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        if (value && typeof value === "object" &&
            typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
            case "string":
                return quote(value);

            case "number":
                return isFinite(value)
                    ? String(value)
                    : "null";

            case "boolean":
            case "null":
                return String(value);

            case "object":
                if (!value) {
                    return "null";
                }

                gap += indent;
                partial = [];

                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap
                                    ? ": "
                                    : ":") + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap
                                    ? ": "
                                    : ":") + v);
                            }
                        }
                    }
                }

                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }

    if (typeof JSON.stringify !== "function") {
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else if (typeof space === "string") {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

            return str("", { "": value });
        };
    }


    if (typeof JSON.parse !== "function") {
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return "\\u" +
                        ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (rx_one.test(text.replace(rx_two, "@")
                .replace(rx_three, "]")
                .replace(rx_four, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function"
                    ? walk({ "": j }, "")
                    : j;
            }

            throw new SyntaxError("JSON.parse");
        };
    }
}());


/* --- utils/AppUtils.js --- */
/**
 * @class AppUtils
 * @description Common utility functions for the application.
 */
var AppUtils = {
    /**
     * Trim whitespace from start and end of string
     * @param {string} str 
     * @returns {string}
     */
    trim: function (str) {
        if (!str) return "";
        return str.replace(/^\s+|\s+$/g, '');
    },

    /**
     * Safely execute a function
     * @param {Function} fn 
     * @param {*} defaultValue 
     * @returns {*}
     */
    safeExecute: function (fn, defaultValue) {
        try {
            return fn();
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Safely get item from array
     * @param {Array} arr 
     * @param {number} index 
     * @param {*} defaultValue 
     * @returns {*}
     */
    safeGet: function (arr, index, defaultValue) {
        return (arr && arr[index] !== undefined) ? arr[index] : (defaultValue || "");
    },

    /**
     * Log error to console/alert
     * @param {string} msg 
     */
    logError: function (msg) {
        if (typeof $.writeln === 'function') {
            $.writeln("ERROR: " + msg);
        } else {
            alert("ERROR: " + msg);
        }
    },

    /**
     * Write content to a file on Desktop
     * @param {string} content 
     * @param {string} fileName 
     * @returns {string} File path
     */
    writeLog: function (content, fileName) {
        var path = Folder.desktop + "/" + fileName;
        var file = new File(path);
        file.encoding = "UTF-8";
        if (file.open("w")) {
            file.write(content);
            file.close();
        }
        return path;
    }
};


/* --- features/extractor/domain/TextItem.js --- */
/**
 * @class TextItem
 * @description Represents a text object found in the Illustrator document.
 */
var TextItem = function (id, text, layerName, parentName) {
    this.id = id;
    this.text = text;
    this.layerName = layerName || "Unknown Layer";
    this.parentName = parentName || "No Parent";
    this.isSelected = true; // Default to selected for translation
};

// Export method for polyfill environments if needed,
// but in ExtendScript we usually just rely on global scope or include order.


/* --- features/extractor/infrastructure/AdobeSelectionRepository.js --- */
/**
 * @class AdobeSelectionRepository
 * @description Handles interaction with Adobe Illustrator selection to retrieve text frames.
 */
var AdobeSelectionRepository = {
    /**
     * @returns {Array<TextItem>} List of found text items
     */
    getSelectedTextItems: function () {
        var items = [];

        if (app.documents.length === 0) return items;

        var selection = app.activeDocument.selection;
        if (!selection || selection.length === 0) return items;

        for (var i = 0; i < selection.length; i++) {
            this._traverseItem(selection[i], items);
        }

        return items;
    },

    /**
     * Recursively traverses items to find TextFrames
     * @private
     */
    _traverseItem: function (item, collection) {
        try {
            if (!item) return;

            // Some item types do not have hidden/locked properties
            var isHidden = false;
            var isLocked = false;
            try {
                isHidden = item.hidden;
                isLocked = item.locked;
            } catch (e) {
                // Ignore property access errors
            }
            if (isHidden || isLocked) return;

            if (item.typename === "TextFrame") {
                var content = item.contents;
                // Filter empty or whitespace-only strings if needed
                if (content && content.replace(/^\s+|\s+$/g, '').length > 0) {
                    // Generate a temporary ID. In AI script, object references are valid 
                    // as long as the script runs, but for UI/JSON we need a string ID.
                    // Using uuid or name if available, else random.
                    var id = item.uuid || ("tf_" + Math.random().toString(36).substr(2, 9));

                    var textItem = new TextItem(
                        id,
                        content,
                        item.layer ? item.layer.name : "",
                        item.parent ? item.parent.name : ""
                    );

                    // Store reference to actual object if needed for later (not serializable)
                    textItem._aiObject = item;

                    collection.push(textItem);
                }
            } else if (item.typename === "GroupItem") {
                for (var j = 0; j < item.pageItems.length; j++) {
                    this._traverseItem(item.pageItems[j], collection);
                }
            }
        } catch (e) {
            // Silently skip problematic items to prevent script crash
        }
    }
};


/* --- features/extractor/application/ExtractSelectedTextUseCase.js --- */
/**
 * @class ExtractSelectedTextUseCase
 * @description Coordinate the extraction of text from current selection.
 */
var ExtractSelectedTextUseCase = {
    repository: null,

    init: function (repository) {
        this.repository = repository;
        return this;
    },

    /**
     * Executes the use case
     * @returns {Array<TextItem>}
     */
    execute: function () {
        if (!this.repository) {
            throw new Error("Repository not initialized in ExtractSelectedTextUseCase");
        }

        var items = this.repository.getSelectedTextItems();

        // Additional business logic could go here (e.g. max items limit, filtering by pattern)

        return items;
    }
};


/* --- features/extractor/presentation/TextListView.js --- */
/**
 * @class TextListView
 * @description UI Component that renders a list of text items with checkboxes.
 */
var TextListView = {
    /**
     * Renders the list panel
     * @param {Window|Group} parent - Parent UI container
     * @param {Array<TextItem>} items - Data to display
     * @returns {Object} Reference to the listbox or panel
     */
    render: function (parent, items) {
        var panel = parent.add("panel", undefined, "Detected Text (" + items.length + ")");
        panel.alignment = ["fill", "fill"];
        panel.alignChildren = ["fill", "top"];

        var list = panel.add("listbox", undefined, "", {
            numberOfColumns: 3,
            showHeaders: true,
            columnTitles: ["Select", "Layer", "Content"],
            multiselect: true
        });

        list.preferredSize = [500, 300];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var listItem = list.add("item", "x"); // "x" as visual check? Listbox limitations...
            // Actually ScriptUI listbox checkable is tricky. 
            // Often implied by selection or custom images.
            // For simplicity, we use text.

            listItem.subItems[0].text = item.layerName;
            listItem.subItems[1].text = item.text.substr(0, 50) + (item.text.length > 50 ? "..." : "");

            // Store ref
            listItem.data = item;

            // Select all by default
            listItem.checked = true;
        }

        return list;
    }
};


/* --- features/font/domain/entities/FontInfo.js --- */
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

/* --- features/font/infrastructure/FontService.js --- */
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


/* --- features/font/application/FontDiscoveryUseCase.js --- */
/**
 * @class FontDiscoveryUseCase
 * @description Application Logic for discovering and filtering fonts.
 */
var FontDiscoveryUseCase = {
    fontService: null,

    /**
     * Initialize with dependencies
     * @param {Object} fontService 
     */
    init: function (fontService) {
        this.fontService = fontService;
        return this;
    },

    /**
     * Execute the use case to get a list of fonts.
     * @returns {Array<FontInfo>}
     */
    execute: function () {
        if (!this.fontService) {
            throw new Error("FontDiscoveryUseCase: Dependencies not initialized");
        }

        return this.fontService.getAllFonts();
    }
};

/* --- features/font/presentation/FontSelectorView.js --- */
/**
 * @class FontSelectorView
 * @description UI Component để chọn Font cho các ngôn ngữ đích (Step 2 của Wizard).
 */
var FontSelectorView = {
    // UI Constants (Matched with MainDialog)
    COL_WIDTH_ORIGINAL: 200,
    COL_WIDTH_TRANS: 200,
    ROW_HEIGHT: 30,

    render: function (container, textItems, targetCols, fontList) {
        var info = container.add("statictext", undefined, "Select Font for each Language Column:");
        
        var gridScroll = container.add("panel", undefined, "");
        gridScroll.alignChildren = ["left", "top"];
        gridScroll.alignment = ["fill", "fill"];

        // --- HEADER ROW ---
        var headerGrp = gridScroll.add("group");
        headerGrp.orientation = "row";
        headerGrp.spacing = 10;
        
        // Col 1: Original Header
        var h1 = headerGrp.add("statictext", undefined, "Font Settings >");
        h1.preferredSize.width = this.COL_WIDTH_ORIGINAL;
        h1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

        // Dynamic Cols Headers
        for (var i = 0; i < targetCols.length; i++) {
            (function(colIndex) {
                var colConfig = targetCols[colIndex];
                
                var colGrp = headerGrp.add("group");
                colGrp.orientation = "column";
                colGrp.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS; // Use explicit reference or 'this' context carefully
                colGrp.alignChildren = ["left", "top"];

                colGrp.add("statictext", undefined, "Lang: " + (colConfig.langCode ? colConfig.langCode.toUpperCase() : "UNK"));
                
                // Font Dropdown
                var fontDrop = colGrp.add("dropdownlist", undefined, []);
                fontDrop.preferredSize.width = 190; // Slightly smaller than col width
                
                // Populate Fonts
                if (colConfig.fontName) {
                    fontDrop.add("item", colConfig.fontName);
                    fontDrop.selection = 0;
                } else {
                    fontDrop.add("item", "Arial");
                    fontDrop.selection = 0;
                }
                
                // Add subset of system fonts
                // Increased limit for production use
                var limit = Math.min(fontList.length, 2000); 
                for(var f = 0; f < limit; f++) {
                    var fName = fontList[f].name;
                    // Avoid duplicates with pre-selected
                    if (fName !== colConfig.fontName) {
                        fontDrop.add("item", fName);
                    }
                }

                fontDrop.onChange = function() {
                    if (fontDrop.selection) {
                        targetCols[colIndex].fontName = fontDrop.selection.text;
                    }
                };
            })(i);
        }

        // --- DATA ROWS ---
        var maxRows = Math.min(textItems.length, 20);
        for (var r = 0; r < maxRows; r++) {
            var item = textItems[r];
            var rowGrp = gridScroll.add("group");
            rowGrp.orientation = "row";
            rowGrp.spacing = 10;

            // Original
            var txtOrg = rowGrp.add("statictext", undefined, item.text);
            txtOrg.preferredSize.width = this.COL_WIDTH_ORIGINAL;
            // Ellipsis for StaticText is automatic in some versions, but better safe
            if (item.text.length > 30) txtOrg.text = item.text.substring(0, 27) + "...";

            // Translated
            for (var c = 0; c < targetCols.length; c++) {
                var val = targetCols[c].translations[item.id] || "(empty)";
                var txtTrans = rowGrp.add("statictext", undefined, val);
                txtTrans.preferredSize.width = this.COL_WIDTH_TRANS;
                if (val.length > 30) txtTrans.text = val.substring(0, 27) + "...";
            }
        }
    }
};

/* --- features/cloner/domain/CloneConfig.js --- */
/**
 * @class CloneConfig
 * @description Value Object chứa cấu hình cho việc clone và positioning.
 */
var CloneConfig = function (margin, startPosition, templateHeight) {
    this.margin = (typeof margin === 'number') ? margin : 10;
    this.startLeft = startPosition[0];
    this.startTop = startPosition[1];
    this.templateHeight = templateHeight;
};

/**
 * Tính toán vị trí top mới cho clone tại index
 * @param {number} index - 0-based index của clone
 * @returns {number} - Y position (top) mới
 */
CloneConfig.prototype.calculateNewTop = function (index) {
    // Coordinate System: Y-axis points UP. Moving down means subtracting Y.
    // New Top = Start Top - (Height + Margin) * (Index + 1)
    return this.startTop - (this.templateHeight + this.margin) * (index + 1);
};


/* --- features/cloner/domain/TranslationTarget.js --- */
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


/* --- features/cloner/domain/ILayerRepository.js --- */
/**
 * @interface ILayerRepository
 * @description Abstract interface định nghĩa contract cho các thao tác với layers.
 * Infrastructure implementations PHẢI implement tất cả các methods.
 */
var ILayerRepository = {
    /**
     * Groups current selection vào một template group
     * @returns {Object|null} Template group info { group, height, position } hoặc null nếu không có selection
     */
    groupSelection: function () {
        throw new Error("ILayerRepository.groupSelection() must be implemented");
    },

    /**
     * Duplicate một group và đặt vị trí dựa theo config
     * @param {Object} templateGroup - Group gốc
     * @param {CloneConfig} config - Cấu hình vị trí
     * @param {number} index - Index của clone (0-based)
     * @param {string} langCode - Mã ngôn ngữ để đặt tên
     * @returns {Object} Group đã được clone
     */
    duplicateAndPosition: function (templateGroup, config, index, langCode) {
        throw new Error("ILayerRepository.duplicateAndPosition() must be implemented");
    },

    /**
     * Thay thế nội dung text trong các items đã clone bằng translations
     * @param {Object} sourceItem - Item gốc
     * @param {Object} destItem - Item đã clone
     * @param {Array} originalTextItems - Danh sách text items gốc
     * @param {Object} translations - Map { id: translatedText }
     * @param {string} fontName - Font cần apply
     */
    syncTraverseAndReplace: function (sourceItem, destItem, originalTextItems, translations, fontName) {
        throw new Error("ILayerRepository.syncTraverseAndReplace() must be implemented");
    },

    /**
     * Hoàn tất quá trình clone (deselect template, redraw)
     * @param {Object} templateGroup - Template group
     */
    finalize: function (templateGroup) {
        throw new Error("ILayerRepository.finalize() must be implemented");
    }
};


/* --- features/cloner/infrastructure/AdobeLayerRepository.js --- */
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
            var transText = this._lookupTranslation(sourceItem, originalTextItems, translations);

            if (transText) {
                destItem.contents = transText;
                this._applyFont(destItem, fontName);
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
     * Tìm translation cho một text item
     */
    repo._lookupTranslation = function (sourceItem, originalItems, translations) {
        for (var i = 0; i < originalItems.length; i++) {
            if (originalItems[i].text === sourceItem.contents) {
                var foundId = originalItems[i].id;
                if (translations && translations[foundId]) {
                    return translations[foundId];
                }
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


/* --- features/cloner/application/ApplyTranslationsUseCase.js --- */
/**
 * @class ApplyTranslationsUseCase
 * @description Use Case điều phối việc clone selection và apply translations.
 * Đây là Application layer - không chứa logic trực tiếp với Adobe API.
 */
var ApplyTranslationsUseCase = {
    /** @type {ILayerRepository} */
    layerRepository: null,

    /**
     * Khởi tạo UseCase với repository dependencies
     * @param {ILayerRepository} layerRepository
     * @returns {ApplyTranslationsUseCase}
     */
    init: function (layerRepository) {
        this.layerRepository = layerRepository;
        return this;
    },

    /**
     * Thực thi use case: Clone và apply translations cho nhiều ngôn ngữ
     * @param {Array} originalTextItems - Danh sách text items gốc { id, text }
     * @param {Array} targetCols - Cấu hình các cột đích { langCode, translations, fontName }
     * @returns {boolean} true nếu thành công
     */
    execute: function (originalTextItems, targetCols) {
        // 1. Validate inputs
        if (!targetCols || targetCols.length === 0) {
            return false;
        }

        if (!this.layerRepository) {
            throw new Error("LayerRepository not initialized in ApplyTranslationsUseCase");
        }

        // 2. Group selection thành template
        var templateInfo = this.layerRepository.groupSelection();
        if (!templateInfo || !templateInfo.group) {
            return false;
        }

        // 3. Tạo CloneConfig
        var config = new CloneConfig(
            10, // Margin giữa các clones (reduced từ 20 xuống 10)
            templateInfo.position,
            templateInfo.height
        );

        // 4. Process từng ngôn ngữ đích
        for (var i = 0; i < targetCols.length; i++) {
            var colConfig = targetCols[i];

            // A. Duplicate và position
            var clone = this.layerRepository.duplicateAndPosition(
                templateInfo.group,
                config,
                i,
                colConfig.langCode
            );

            // B. Thay thế text và apply font
            this.layerRepository.syncTraverseAndReplace(
                templateInfo.group,
                clone,
                originalTextItems,
                colConfig.translations,
                colConfig.fontName
            );
        }

        // 5. Finalize
        this.layerRepository.finalize(templateInfo.group);

        return true;
    }
};


/* --- features/cloner/presentation/ClonerController.js --- */
/**
 * @class ClonerController
 * @description Presentation layer controller - wires dependencies và expose API cho bên ngoài.
 */
var ClonerController = {
    /** @type {ApplyTranslationsUseCase} */
    useCase: null,

    /**
     * Khởi tạo controller với tất cả dependencies
     * @returns {ClonerController}
     */
    init: function () {
        // Wire dependencies theo Dependency Inversion
        this.useCase = ApplyTranslationsUseCase.init(AdobeLayerRepository);
        return this;
    },

    /**
     * API chính: Apply translations và clone selection
     * @param {Array} originalTextItems - Danh sách text items gốc
     * @param {Array} targetCols - Cấu hình các cột đích
     * @returns {boolean}
     */
    applyTranslations: function (originalTextItems, targetCols) {
        if (!this.useCase) {
            this.init();
        }
        return this.useCase.execute(originalTextItems, targetCols);
    }
};


/* --- features/translator/infrastructure/PythonBackendAdapter.js --- */
/**
 * @class PythonBackendAdapter
 * @description Handles communication with the Python Backend Service using cURL.
 */
var PythonBackendAdapter = {
    baseUrl: "http://127.0.0.1:8000",

    /**
     * Send translation request to backend
     * @param {TranslationJob} job
     * @returns {Object} Response JSON
     */
    translate: function (job) {
        var endpoint = this.baseUrl + "/api/translate";

        // Prepare payload
        var payload = {
            source_lang: job.sourceLang,
            target_lang: job.targetLang,
            items: [],
        };

        for (var i = 0; i < job.items.length; i++) {
            if (job.items[i].isSelected) {
                payload.items.push({
                    id: job.items[i].id,
                    text: job.items[i].text,
                    layer_name: job.items[i].layerName
                });
            }
        }

        // Create temp files for request/response
        var tempFolder = Folder.temp;
        var reqFile = new File(tempFolder + "/req_" + new Date().getTime() + ".json");
        var resFile = new File(tempFolder + "/res_" + new Date().getTime() + ".json");

        // Write JSON payload
        reqFile.open("w");
        reqFile.encoding = "UTF-8";
        reqFile.write(JSON.stringify(payload));
        reqFile.close();

        // Build cURL command
        // -X POST -H "Content-Type: application/json" -d @reqFile -o resFile
        var cmd = 'curl -s -X POST "' + endpoint + '"';
        cmd += ' -H "Content-Type: application/json"';
        cmd += ' -d "@' + reqFile.fsName + '"';
        cmd += ' -o "' + resFile.fsName + '"';

        // Execute
        // Illustrator doesn't have app.system, so we wrap in a bat file
        var batFile = new File(tempFolder + "/req_" + new Date().getTime() + ".bat");
        batFile.open("w");
        batFile.write('@echo off\n');
        batFile.write(cmd);
        batFile.close();

        batFile.execute();

        // Wait for response file (naive wait loop, since execute is async)
        // Max 10 seconds
        var timeout = 100;
        while (timeout > 0 && !resFile.exists) {
            $.sleep(100);
            timeout--;
        }

        batFile.remove();

        // Read response
        var result = null;
        if (resFile.exists) {
            resFile.open("r");
            resFile.encoding = "UTF-8";
            var content = resFile.read();
            resFile.close();

            try {
                // We assume JSON polyfill (json2.js) is included in build
                result = JSON.parse(content);
            } catch (e) {
                throw new Error("Failed to parse backend response: " + e.message);
            }

            // Cleanup
            resFile.remove();
        } else {
            throw new Error("No response from backend server. Is it running?");
        }

        reqFile.remove();

        return result;
    }
};


/* --- features/translator/application/SubmitTranslationUseCase.js --- */
/**
 * @class SubmitTranslationUseCase
 * @description Coordinates the Translation process.
 * Acts as the Delegate for MainTranslatorDialog.
 */
var SubmitTranslationUseCase = {
    backendAdapter: null,
    clonerController: null,

    init: function (backendAdapter, clonerController) {
        this.backendAdapter = backendAdapter;
        this.clonerController = clonerController;
        return this;
    },

    /**
     * Called when User clicks "Finish (Clone)" in the UI.
     * @param {Array} textItems - Original text items
     * @param {Array} targetCols - Configuration columns with translations
     */
    onFinish: function (textItems, targetCols) {
        if (!this.clonerController) {
            alert("Error: ClonerController not initialized.");
            return;
        }

        try {
            // Updated to use ClonerController (Clean Architecture)
            this.clonerController.applyTranslations(textItems, targetCols);

            // Success Message
            var totalLangs = targetCols.length;
            alert("Success! Created clones for " + totalLangs + " language(s).");

        } catch (e) {
            alert("Error during cloning: " + e.message);
        }
    },

    /**
     * Executes batch translation via Backend Adapter
     * @param {Array} textItems - Items to translate
     * @param {string} sourceLang - Source language code
     * @param {string} targetLang - Target language code
     * @returns {Object} Translation map { id: translatedText }
     */
    translateBatch: function (textItems, sourceLang, targetLang) {
        if (!this.backendAdapter) {
            throw new Error("Backend Adapter not initialized");
        }

        // Prepare job
        var job = {
            items: textItems,
            sourceLang: sourceLang,
            targetLang: targetLang
        };

        // Call API
        var response = this.backendAdapter.translate(job);

        // Parse response (New Schema: { translations: [ {id, text} ] })
        var map = {};
        if (response && response.translations) {
            var inputIds = {}; // Helper to track original text if needed, but we rely on ID
            for (var i = 0; i < response.translations.length; i++) {
                var item = response.translations[i];
                if (item.id && item.text) {
                    map[item.id] = item.text;
                }
            }
        }

        return map;
    }
};

/* --- features/translator/presentation/MainTranslatorDialog.js --- */
/**
 * @class MainTranslatorDialog
 * @description Quản lý giao diện chính theo quy trình 2 bước: Dịch -> Chọn Font.
 */
var MainTranslatorDialog = {
    // Dependencies
    coordinator: null,

    // State
    textItems: [],      // Danh sách text gốc
    fontList: [],       // Danh sách font hệ thống
    targetCols: [],     // Cấu hình các cột đích

    // UI Constants
    COL_WIDTH_ORIGINAL: 200,
    COL_WIDTH_TRANS: 200,
    ROW_HEIGHT: 30,

    init: function (coordinator) {
        this.coordinator = coordinator;
        return this;
    },

    show: function (textItems, fontList) {
        this.textItems = textItems;
        this.fontList = fontList || [];

        this.targetCols = [{
            langCode: 'vi',
            fontName: (this.fontList.length > 0) ? this.fontList[0].name : "Arial",
            translations: {}
        }];

        this.currentStep = 1;
        this.buildWindow();
    },

    buildWindow: function () {
        var self = this;
        this.window = new Window("dialog", "Auto Translate & Clone");
        this.window.orientation = "column";
        this.window.alignChildren = ["fill", "fill"];
        this.window.preferredSize = [850, 600];

        // Header
        var header = this.window.add("group");
        header.alignment = "fill";
        this.lblStep = header.add("statictext", undefined, "Step 1: Translate Content");
        this.lblStep.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);

        // Main Content (Dynamic)
        this.mainPanel = this.window.add("group");
        this.mainPanel.orientation = "column";
        this.mainPanel.alignChildren = ["fill", "fill"];
        this.mainPanel.alignment = ["fill", "fill"];

        // Footer
        var footer = this.window.add("group");
        footer.orientation = "row";
        footer.alignment = ["right", "bottom"];

        this.btnClose = footer.add("button", undefined, "Cancel");
        this.btnBack = footer.add("button", undefined, "< Back");
        this.btnAction = footer.add("button", undefined, "Translate");

        this.btnClose.onClick = function () { self.window.close(); };

        this.btnBack.onClick = function () {
            if (self.currentStep > 1) {
                self.currentStep--;
                self.renderCurrentStep();
            }
        };

        this.btnAction.onClick = function () {
            self.handleAction();
        };

        this.renderCurrentStep();
        this.window.show();
    },

    handleAction: function () {
        if (this.currentStep === 1) {
            this.currentStep = 2;
            this.renderCurrentStep();
        } else {
            this.window.close();
            if (this.coordinator) {
                this.coordinator.onFinish(this.textItems, this.targetCols);
            }
        }
    },

    renderCurrentStep: function () {
        // Xóa sạch con
        while (this.mainPanel.children.length > 0) {
            this.mainPanel.remove(this.mainPanel.children[0]);
        }

        if (this.currentStep === 1) {
            this.lblStep.text = "Step 1: Setup Languages & Translate";
            this.btnBack.enabled = false;
            this.btnAction.text = "Next: Select Fonts >";
            this.renderStep1_Translate(this.mainPanel);
        } else {
            this.lblStep.text = "Step 2: Assign Fonts & Review";
            this.btnBack.enabled = true;
            this.btnAction.text = "Finish (Clone)";
            this.renderStep2_Font(this.mainPanel);
        }

        this.window.layout.layout(true);
    },

    // --- STEP 1: TRANSLATE UI ---
    renderStep1_Translate: function (container) {
        var self = this;

        // 1. Toolbar
        var toolbar = container.add("group");
        toolbar.orientation = "row";
        toolbar.add("statictext", undefined, "Languages:");
        var btnAddCol = toolbar.add("button", undefined, "+ Add Language");

        // Mock Translate Button
        var btnMockTrans = toolbar.add("button", undefined, "⚡ Mock Translate");

        // 2. Grid Scroll View
        var gridScroll = container.add("panel", undefined, "");
        gridScroll.alignChildren = ["left", "top"];
        gridScroll.alignment = ["fill", "fill"];

        // --- HEADER ROW ---
        var headerGrp = gridScroll.add("group");
        headerGrp.orientation = "row";
        headerGrp.spacing = 10;

        // Col 1: Original Header
        var h1 = headerGrp.add("statictext", undefined, "Original Text");
        h1.preferredSize.width = this.COL_WIDTH_ORIGINAL;
        h1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

        // Dynamic Cols Headers
        for (var i = 0; i < this.targetCols.length; i++) {
            (function (colIndex) {
                var colGrp = headerGrp.add("group");
                colGrp.orientation = "row";
                colGrp.preferredSize.width = self.COL_WIDTH_TRANS;

                var dropLang = colGrp.add("dropdownlist", undefined, ["Vietnamese", "English", "Japanese", "French", "Korean"]);
                dropLang.selection = self.getLangIndex(self.targetCols[colIndex].langCode);
                dropLang.preferredSize.width = 150;

                var btnDel = colGrp.add("button", undefined, "X");
                btnDel.size = [25, 25];

                // Events
                dropLang.onChange = function () {
                    self.targetCols[colIndex].langCode = self.getLangCode(dropLang.selection.index);
                };
                btnDel.onClick = function () {
                    self.targetCols.splice(colIndex, 1);
                    self.renderCurrentStep();
                };
            })(i);
        }

        // --- DATA ROWS ---
        var maxRows = Math.min(this.textItems.length, 20);
        for (var r = 0; r < maxRows; r++) {
            var item = this.textItems[r];
            var rowGrp = gridScroll.add("group");
            rowGrp.orientation = "row";
            rowGrp.spacing = 10; // Match Header Spacing

            // Original Text Cell - Styled to be readable (not gray disabled)
            var orgCell = rowGrp.add("group");
            orgCell.preferredSize.width = this.COL_WIDTH_ORIGINAL;
            orgCell.preferredSize.height = this.ROW_HEIGHT;
            var txtOrg = orgCell.add("statictext", undefined, item.text, { truncate: "end" });
            txtOrg.preferredSize.width = this.COL_WIDTH_ORIGINAL - 16;
            txtOrg.graphics.foregroundColor = txtOrg.graphics.newPen(
                txtOrg.graphics.PenType.SOLID_COLOR, [0.9, 0.85, 0.7], 1  // Warm light color
            );
            txtOrg.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 12);

            // Trans Cells
            for (var c = 0; c < this.targetCols.length; c++) {
                (function (colIdx, rowItem) {
                    var transVal = self.targetCols[colIdx].translations[rowItem.id] || "";
                    var txtTrans = rowGrp.add("edittext", undefined, transVal);
                    txtTrans.preferredSize.width = self.COL_WIDTH_TRANS;
                    txtTrans.preferredSize.height = self.ROW_HEIGHT;

                    txtTrans.onChange = function () {
                        self.targetCols[colIdx].translations[rowItem.id] = txtTrans.text;
                    };
                })(c, item);
            }
        }

        // Actions
        btnAddCol.onClick = function () {
            self.targetCols.push({ langCode: 'en', fontName: (self.fontList.length > 0 ? self.fontList[0].name : 'Arial'), translations: {} });
            self.renderCurrentStep();
        };

        // Update button text to indicate real API usage
        btnMockTrans.text = "⚡ Translate via API";

        btnMockTrans.onClick = function () {
            // Check if user confirmed (simple check)
            // if (!confirm("Send data to local backend?")) return;

            try {
                // Call API for each target column
                for (var c = 0; c < self.targetCols.length; c++) {
                    var lang = self.targetCols[c].langCode;

                    // Call Batch Translation via UseCase (which uses Adapter)
                    // This returns map: { id: "translated text" }
                    var resultsMap = self.coordinator.translateBatch(self.textItems, "auto", lang);

                    // Apply to column data
                    for (var r = 0; r < self.textItems.length; r++) {
                        var itm = self.textItems[r];
                        if (resultsMap[itm.id]) {
                            // Update translation in memory
                            self.targetCols[c].translations[itm.id] = resultsMap[itm.id];
                        }
                    }
                }
                self.renderCurrentStep(); // Refresh UI to show translations

            } catch (e) {
                alert("Translation Error: " + e.message + "\n\nPlease ensure:\n1. Backend server is running (port 8000)\n2. Valid languages selected");
            }
        };
    },

    // --- STEP 2: FONT UI ---
    renderStep2_Font: function (container) {
        if (typeof FontSelectorView !== 'undefined') {
            FontSelectorView.render(container, this.textItems, this.targetCols, this.fontList);
        } else {
            container.add("statictext", undefined, "Error: FontSelectorView component not loaded.");
        }
    },

    // Helpers
    getLangIndex: function (code) {
        var map = { 'vi': 0, 'en': 1, 'ja': 2, 'fr': 3, 'ko': 4 };
        return map[code] !== undefined ? map[code] : 1;
    },

    getLangCode: function (index) {
        var codes = ['vi', 'en', 'ja', 'fr', 'ko'];
        return codes[index] || 'en';
    }
};


/* --- host_app.jsx --- */
/**
 * @file host_app.jsx
 * @description Main Entry Point for the Illustrator Translation Client.
 * Note: In production, all these files would be bundled into one .jsx file.
 */

// --- Includes (Manual Dependency Injection for Development) ---
// Note: Relative paths in #include are tricky in some AI versions. 
// Assuming this file is run from the Client root.

// 1. Shared / Utils
// included by build

// 2. Feature: Extractor
// included by build
// included by build
// included by build
// included by build

// 3. Feature: Cloner
// included by build

// 4. Feature: Translator
// included by build
// included by build
// included by build


// --- Main Execution Block ---
(function () {
    try {
        // 1. Setup Dependencies
        // Extractor
        ExtractSelectedTextUseCase.init(AdobeSelectionRepository);

        // Utils
        // AppUtils is global

        // Font Manager
        FontService.init(AppUtils);
        FontDiscoveryUseCase.init(FontService);

        // Cloner (Clean Architecture Refactor)
        // AdobeLayerRepository is stateless infra
        // ClonerController wires everything
        var clonerController = ClonerController.init();

        // Translator
        // Initialize UseCase with BackendAdapter and ClonerController
        SubmitTranslationUseCase.init(PythonBackendAdapter, clonerController);
        MainTranslatorDialog.init(SubmitTranslationUseCase);

        // 2. Run Flow
        // Step A: Extract Text
        var textItems = ExtractSelectedTextUseCase.execute();

        if (textItems.length === 0) {
            alert("No text found in selection! Please select objects containing text.");
            return;
        }

        // Step B: Get Fonts
        var fontList = FontDiscoveryUseCase.execute();

        // Step C: Show UI
        MainTranslatorDialog.show(textItems, fontList);

    } catch (e) {
        alert("System Error: " + e.message + "\nLine: " + e.line);
    }
})();

