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

        // Col 0: Checkbox Header
        var h0 = headerGrp.add("statictext", undefined, "All");
        h0.preferredSize.width = 25;

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

                // ROW: [ Dropdown ] [ SearchBtn ]
                var rowControls = colGrp.add("group");
                rowControls.orientation = "row";
                rowControls.spacing = 2; // Tight spacing

                // Font Dropdown (80% width)
                var fontDrop = rowControls.add("dropdownlist", undefined, []);
                fontDrop.preferredSize.width = 150;

                // Search Button (20% width - icon style)
                var btnSearch = rowControls.add("button", undefined, "F");
                btnSearch.preferredSize.width = 30; // Small square button
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

                // Checkbox
                var chk = rowGrp.add("checkbox", undefined, "");
                chk.preferredSize.width = 25;
                // Default to true if undefined
                if (typeof item.isFontIncluded === 'undefined') item.isFontIncluded = true;
                chk.value = item.isFontIncluded;

                // Original
                var txtOrg = rowGrp.add("statictext", undefined, item.text);
                txtOrg.preferredSize.width = FontSelectorView.COL_WIDTH_ORIGINAL;
                // Ellipsis for StaticText is automatic in some versions, but better safe
                if (item.text.length > 30) txtOrg.text = item.text.substring(0, 27) + "...";

                // Translated cells logging
                var transCells = [];
                for (var c = 0; c < targetCols.length; c++) {
                    var val = targetCols[c].translations[item.id] || "(empty)";
                    var txtTrans = rowGrp.add("statictext", undefined, val);
                    txtTrans.preferredSize.width = FontSelectorView.COL_WIDTH_TRANS;
                    if (val.length > 30) txtTrans.text = val.substring(0, 27) + "...";
                    transCells.push(txtTrans);
                }

                // Toggle Logic
                chk.onClick = function () {
                    item.isFontIncluded = chk.value;
                    // Visual feedback: If unchecked (Keep Original), maybe dim the translated text slightly?
                    // For now, we just keep them enabled as they ARE being translated.
                    // We can explicitly enable them to be sure.
                    txtOrg.enabled = true;
                    for (var k = 0; k < transCells.length; k++) {
                        transCells[k].enabled = true; // Always enabled content
                    }
                };
            })(textItems[r]);
        }
    }
};