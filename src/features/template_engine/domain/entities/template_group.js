/**
 * Entity: TemplateGroup
 * Đại diện cho một Group template trong Illustrator
 * @namespace
 */
var TemplateGroup = {
    /**
     * Tạo entity TemplateGroup từ GroupItem
     * @param {GroupItem} groupItem - Illustrator GroupItem
     * @returns {Object} TemplateGroup entity
     */
    create: function (groupItem) {
        return {
            name: groupItem.name || "Unnamed",
            width: groupItem.width || 0,
            height: groupItem.height || 0,
            top: groupItem.top || 0,
            left: groupItem.left || 0,
            _nativeObject: groupItem
        };
    },

    /**
     * Lấy native Illustrator object
     * @param {Object} entity
     * @returns {GroupItem}
     */
    getNative: function (entity) {
        return entity._nativeObject;
    }
};
