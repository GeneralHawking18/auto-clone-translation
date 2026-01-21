/**
 * Entity: FontInfo
 * Đại diện cho thông tin một font
 * @namespace
 */
var FontInfo = {
    /**
     * Tạo entity FontInfo mới
     * @param {string} name - Tên font
     * @param {boolean} exists - Font có tồn tại trong hệ thống không
     * @param {string} matchedName - Tên font thực sự được match
     * @returns {Object} FontInfo entity
     */
    create: function (name, exists, matchedName) {
        return {
            name: name || "",
            exists: exists || false,
            matchedName: matchedName || ""
        };
    },

    /**
     * Tạo entity từ kết quả check
     * @param {string} name
     * @param {Object} checkResult - { exists, matchedName }
     * @returns {Object}
     */
    fromCheckResult: function (name, checkResult) {
        return this.create(
            name,
            checkResult.exists,
            checkResult.matchedName
        );
    }
};
