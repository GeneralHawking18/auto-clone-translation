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