/**
 * @class CloneConfig
 * @description Value Object chứa cấu hình cho việc clone và positioning.
 */
var CloneConfig = function (margin, startPosition, templateHeight) {
    this.margin = (typeof margin === 'number') ? margin : 10;
    this.startLeft = startPosition[0];
    this.startTop = startPosition[1];
    this.templateHeight = templateHeight;
};

/**
 * Tính toán vị trí top mới cho clone tại index
 * @param {number} index - 0-based index của clone
 * @returns {number} - Y position (top) mới
 */
CloneConfig.prototype.calculateNewTop = function (index) {
    // Coordinate System: Y-axis points UP. Moving down means subtracting Y.
    // New Top = Start Top - (Height + Margin) * (Index + 1)
    return this.startTop - (this.templateHeight + this.margin) * (index + 1);
};
