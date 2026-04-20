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
    var width = Math.abs(this.sourceArtboardRect[2] - this.sourceArtboardRect[0]);
    var height = Math.abs(this.sourceArtboardRect[3] - this.sourceArtboardRect[1]);
    
    var maxRows = 4; // Cứ 4 artboard (bao gồm cả gốc) thì tạo cột mới để tránh lỗi AOoC
    var itemIndex = index + 1; // index = 0 là bản clone đầu tiên, sau bản gốc (itemIndex = 1)
    
    var row = itemIndex % maxRows;
    var col = Math.floor(itemIndex / maxRows);

    var offsetX = (width + this.artboardSpacing) * col;
    var offsetY = (height + this.artboardSpacing) * row;

    // Di chuyển theo lưới (Grid): Thêm vào X (sang cột mới), Trừ khỏi Y (xuống dòng)
    return [
        this.sourceArtboardRect[0] + offsetX,
        this.sourceArtboardRect[1] - offsetY,
        this.sourceArtboardRect[2] + offsetX,
        this.sourceArtboardRect[3] - offsetY
    ];
};

/**
 * Tính toán vị trí mới cho clone dựa trên artboard offset (Theo chiều dọc)
 * @param {number} index - 0-based index
 * @param {Array} originalPosition - [x, y] của template gốc
 * @returns {Array} - Vị trí mới [x, y]
 */
CloneConfig.prototype.calculateNewPosition = function (index, originalPosition) {
    // Để giữ nguyên vị trí tương đối so với artboard, ta tính khoảng cách (offset)
    // từ vị trí gốc (originalPosition) đến góc trên cùng bên trái của source artboard.
    var relativeX = originalPosition[0] - this.sourceArtboardRect[0];
    var relativeY = originalPosition[1] - this.sourceArtboardRect[1];

    // Tính toán tọa độ artboard mới
    var newRect = this.calculateNewArtboardRect(index);

    // Vị trí mới = Tọa độ góc trên cùng bên trái của artboard mới + offset tương đối
    var newPositionX = newRect[0] + relativeX;
    var newPositionY = newRect[1] + relativeY;

    return [newPositionX, newPositionY];
};


/**
 * (Legacy) Tính toán vị trí top mới cho clone tại index (không dùng artboard)
 * @param {number} index - 0-based index của clone
 * @returns {number} - Y position (top) mới
 */
CloneConfig.prototype.calculateNewTop = function (index) {
    return this.startTop - (this.templateHeight + this.margin) * (index + 1);
};
