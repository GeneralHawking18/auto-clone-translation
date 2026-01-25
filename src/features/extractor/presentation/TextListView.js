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
