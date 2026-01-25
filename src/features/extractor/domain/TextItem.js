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
