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
