/**
 * @class CloneConfig
 * @description Value Object chứa cấu hình cho việc clone và positioning.
 */
var CloneConfig = function (margin, startPosition, templateHeight, sourceArtboardRect) {
    this.margin = (typeof margin === 'number') ? margin : 10;
    this.startLeft = startPosition[0];
    this.startTop = startPosition[1];
    this.templateHeight = templateHeight;
    this.sourceArtboardRect = sourceArtboardRect; // [left, top, right, bottom]
    this.artboardSpacing = 300; // Tăng khoảng cách giữa các artboard
};

/**
 * Tính toán tọa độ cho artboard mới tại index (Theo chiều dọc)
 * @param {number} index - 0-based index
 * @returns {Array} - [left, top, right, bottom]
 */
CloneConfig.prototype.calculateNewArtboardRect = function (index) {
    var height = Math.abs(this.sourceArtboardRect[3] - this.sourceArtboardRect[1]);
    var offset = (height + this.artboardSpacing) * (index + 1);

    // Di chuyển xuống dưới: Giữ nguyên X, trừ Offset khỏi Y (top và bottom)
    return [
        this.sourceArtboardRect[0],
        this.sourceArtboardRect[1] - offset,
        this.sourceArtboardRect[2],
        this.sourceArtboardRect[3] - offset
    ];
};

/**
 * Tính toán vị trí mới cho clone dựa trên artboard offset (Theo chiều dọc)
 * @param {number} index - 0-based index
 * @param {Array} originalPosition - [x, y] của template gốc
 * @returns {Array} - Vị trí mới [x, y]
 */
CloneConfig.prototype.calculateNewPosition = function (index, originalPosition) {
    var height = Math.abs(this.sourceArtboardRect[3] - this.sourceArtboardRect[1]);
    var offset = (height + this.artboardSpacing) * (index + 1);

    // Di chuyển xuống dưới: Giữ nguyên X, trừ Offset khỏi Y
    return [originalPosition[0], originalPosition[1] - offset];
};


/**
 * (Legacy) Tính toán vị trí top mới cho clone tại index (không dùng artboard)
 * @param {number} index - 0-based index của clone
 * @returns {number} - Y position (top) mới
 */
CloneConfig.prototype.calculateNewTop = function (index) {
    return this.startTop - (this.templateHeight + this.margin) * (index + 1);
};
