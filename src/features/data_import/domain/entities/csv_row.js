/**
 * Entity: CsvRow
 * Đại diện cho một dòng dữ liệu đã được parse từ CSV
 * @namespace
 */
var CsvRow = {
    /**
     * Tạo entity CsvRow mới
     * @param {Object} data - Raw data object
     * @returns {Object} CsvRow entity
     */
    create: function (data) {
        return {
            headers: data.headers || [],
            referenceMap: data.referenceMap || {},
            referenceMapOriginal: data.referenceMapOriginal || {},
            rows: data.rows || [],
            dataRows: data.dataRows || [],
            separator: data.separator || "\t"
        };
    },

    /**
     * Kiểm tra entity có hợp lệ không
     * @param {Object} entity
     * @returns {boolean}
     */
    isValid: function (entity) {
        return entity &&
            entity.headers &&
            entity.headers.length > 0 &&
            entity.rows.length > 0;
    }
};
