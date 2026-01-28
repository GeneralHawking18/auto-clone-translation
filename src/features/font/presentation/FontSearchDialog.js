/**
 * @class FontSearchDialog
 * @description Modal dialog allowing users to search and select a font from a list.
 */
var FontSearchDialog = {
    show: function (fontList) {
        var selectedFont = null;
        var win = new Window("dialog", "Search Font");
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];

        // 1. Search Box
        var grpSearch = win.add("group");
        grpSearch.add("statictext", undefined, "Search:");
        var txtSearch = grpSearch.add("edittext", undefined, "");
        txtSearch.preferredSize.width = 300;
        txtSearch.active = true; // Focus on open

        // 2. Result List
        var listFonts = win.add("listbox", undefined, []);
        listFonts.preferredSize = [400, 300];

        // Populate initial list (limit to first 100 for performance)
        var updateList = function (keyword) {
            listFonts.removeAll();
            var count = 0;
            var kw = keyword.toLowerCase();
            for (var i = 0; i < fontList.length; i++) {
                var fName = fontList[i].name;
                if (kw === "" || fName.toLowerCase().indexOf(kw) >= 0) {
                    listFonts.add("item", fName);
                    count++;
                    if (count > 200) break; // Limit results
                }
            }
        };

        // Initial populate
        updateList("");

        // Search Event
        txtSearch.onChanging = function () {
            updateList(txtSearch.text);
        };

        // 3. Actions
        var grpBtn = win.add("group");
        grpBtn.orientation = "row";
        grpBtn.alignment = ["right", "bottom"];

        var btnCancel = grpBtn.add("button", undefined, "Cancel");
        var btnOK = grpBtn.add("button", undefined, "OK", { name: "ok" });

        btnCancel.onClick = function () {
            win.close();
        };

        btnOK.onClick = function () {
            if (listFonts.selection) {
                selectedFont = listFonts.selection.text;
                win.close();
            } else {
                alert("Please select a font from the list.");
            }
        };

        // Double click to select
        listFonts.onDoubleClick = function () {
            if (listFonts.selection) {
                selectedFont = listFonts.selection.text;
                win.close();
            }
        };

        win.show();
        return selectedFont;
    }
};
