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
            (function (colIndex) {
                var colConfig = targetCols[colIndex];

                var colGrp = headerGrp.add("group");
                colGrp.orientation = "column";
                colGrp.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS;
                colGrp.alignChildren = ["left", "top"];

                // COMPACT HEADER: Just Language Name (Bold)
                var langName = (typeof LanguageConstants !== 'undefined')
                    ? LanguageConstants.getName(colConfig.langCode)
                    : (colConfig.langCode || "UNK");

                var lblLang = colGrp.add("statictext", undefined, langName);
                lblLang.graphics.font = ScriptUI.newFont("Arial", "BOLD", 13);

                // --- NEW ROW: Checkbox label (Header for checkboxes) ---
                var chkHeaderRow = colGrp.add("group");
                chkHeaderRow.orientation = "row";
                chkHeaderRow.spacing = 0; // Match data row spacing logic

                var chkHeaderSpace = chkHeaderRow.add("statictext", undefined, ""); // Removed emoji to prevent encoding errors
                chkHeaderSpace.preferredSize.width = 25; // Exact width of the checkbox in data rows

                var chkHeaderLabel = chkHeaderRow.add("statictext", undefined, "Apply New Font"); // English translation
                chkHeaderLabel.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 11);
                chkHeaderLabel.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS - 25;

                // --- ROW: [ Dropdown ] [ SearchBtn ] ---
                var rowControls = colGrp.add("group");
                rowControls.orientation = "row";
                rowControls.spacing = 2;

                var fontDrop = rowControls.add("dropdownlist", undefined, []);
                fontDrop.preferredSize.width = 150;

                var btnSearch = rowControls.add("button", undefined, "F");
                btnSearch.preferredSize.width = 25;
                btnSearch.helpTip = "Search Font";

                // Populate Fonts in Dropdown (Limited set)
                var populateDropdown = function (selectedName) {
                    fontDrop.removeAll();
                    var found = false;

                    // Always add Current Selected first
                    if (selectedName) {
                        fontDrop.add("item", selectedName);
                        fontDrop.selection = 0;
                        found = true;
                    } else {
                        fontDrop.add("item", "Arial");
                        fontDrop.selection = 0;
                    }

                    // Add common/top fonts or first 50
                    var limit = Math.min(fontList.length, 50);
                    for (var f = 0; f < limit; f++) {
                        var fName = fontList[f].name;
                        if (fName !== selectedName) {
                            fontDrop.add("item", fName);
                        }
                    }
                };

                populateDropdown(colConfig.fontName);

                // Events
                fontDrop.onChange = function () {
                    if (fontDrop.selection) {
                        targetCols[colIndex].fontName = fontDrop.selection.text;
                    }
                };

                btnSearch.onClick = function () {
                    if (typeof FontSearchDialog !== 'undefined') {
                        var result = FontSearchDialog.show(fontList);
                        if (result) {
                            targetCols[colIndex].fontName = result;
                            populateDropdown(result); // Refresh dropdown with new selection
                        }
                    } else {
                        alert("FontSearchDialog not loaded");
                    }
                };

            })(i);
        }

        // --- DATA ROWS ---
        var maxRows = Math.min(textItems.length, 20);
        for (var r = 0; r < maxRows; r++) {
            (function (item) {
                var rowGrp = gridScroll.add("group");
                rowGrp.orientation = "row";
                rowGrp.spacing = 10;

                // Checkbox All
                // Removed global row checkbox

                // Original
                var txtOrg = rowGrp.add("statictext", undefined, item.text);
                txtOrg.preferredSize.width = FontSelectorView.COL_WIDTH_ORIGINAL; // Match header width for perfect alignment
                // Ellipsis for StaticText is automatic in some versions, but better safe
                if (item.text.length > 30) txtOrg.text = item.text.substring(0, 27) + "...";

                // Translated cells logging
                for (var c = 0; c < targetCols.length; c++) {
                    (function (colConfig) {
                        var cellGrp = rowGrp.add("group");
                        cellGrp.orientation = "row";
                        cellGrp.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS;
                        cellGrp.alignChildren = ["left", "center"];
                        cellGrp.spacing = 0; // Force 0 spacing to align exactly with chkHeaderRow spacing

                        // Initialize the map if it doesn't exist
                        if (!colConfig.fontAppliedMap) {
                            colConfig.fontAppliedMap = {};
                        }

                        // Determine default state: if not in map, fallback to whether source or target text is ideographic
                        if (typeof colConfig.fontAppliedMap[item.id] === 'undefined') {
                            var transValForCheck = colConfig.translations[item.id] || "";
                            var isTargetIdeographic = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(transValForCheck);
                            var isSourceIdeographic = typeof item.isIdeographic !== 'undefined' ? !!item.isIdeographic : false;
                            colConfig.fontAppliedMap[item.id] = isSourceIdeographic || isTargetIdeographic;
                        }

                        var chkGrp = cellGrp.add("group");
                        chkGrp.margins = 0;
                        chkGrp.spacing = 0;
                        chkGrp.preferredSize.width = 25;
                        chkGrp.alignChildren = ["left", "center"];

                        var chk = chkGrp.add("checkbox", undefined, "");
                        chk.value = colConfig.fontAppliedMap[item.id];
                        chk.helpTip = "Apply font to this text";

                        var val = colConfig.translations[item.id] || "(empty)";
                        var txtTrans = cellGrp.add("statictext", undefined, val);
                        txtTrans.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS - 25; // Force exact width so next column aligns perfectly
                        if (val.length > 25) txtTrans.text = val.substring(0, 22) + "...";

                        // Toggle Logic for specific cell
                        chk.onClick = function () {
                            colConfig.fontAppliedMap[item.id] = chk.value;
                        };
                    })(targetCols[c]);
                }
            })(textItems[r]);
        }
    }
};