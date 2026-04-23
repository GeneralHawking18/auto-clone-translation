/**
 * @class CloneConfig
 * @description Value Object chứa cấu hình cho việc clone và positioning.
 */

/**
 * @param {number} margin
 * @param {Array} startPosition - [x, y] của template gốc
 * @param {number} templateHeight
 * @param {Array} sourceArtboardRect - [left, top, right, bottom]
 * @param {number} totalCount - Tổng số clone cần tạo
 * @param {number} canvasXLimit - Giới hạn canvas X (pt), lấy từ AdobeLayerRepository.getCanvasXLimit()
 */
var CloneConfig = function (margin, startPosition, templateHeight, sourceArtboardRect, totalCount, canvasXLimit) {
    this.margin = (typeof margin === 'number') ? margin : 10;
    this.startLeft = startPosition[0];
    this.startTop = startPosition[1];
    this.templateHeight = templateHeight;
    this.sourceArtboardRect = sourceArtboardRect; // [left, top, right, bottom]
    this.artboardSpacing = 300;

    totalCount    = totalCount    || 1;
    canvasXLimit  = canvasXLimit  || 10000; // fallback bảo thủ

    var srcLeft = sourceArtboardRect[0];
    var srcTop  = sourceArtboardRect[1]; // top edge (lớn hơn bottom trong AI coords)
    var artW    = Math.abs(sourceArtboardRect[2] - sourceArtboardRect[0]);
    var artH    = Math.abs(sourceArtboardRect[3] - sourceArtboardRect[1]);
    var sp      = this.artboardSpacing;

    // --- Tính số cột tối đa trong giới hạn X ---
    // Cột 0 = artboard gốc, cột 1+ = clone
    // right edge của cột N = srcLeft + artW + (artW + sp) * N ≤ canvasXLimit
    var availableX   = canvasXLimit - srcLeft - artW;
    var maxExtraCols = Math.max(0, Math.floor(availableX / (artW + sp)));
    var maxCols      = maxExtraCols + 1; // cột 0 = nguồn, clone từ cột 1

    // --- Tính số hàng tối đa trong giới hạn Y (trục Y âm = xuống dưới) ---
    // bottom edge của hàng R = srcTop - (artH + sp) * R ≥ -canvasXLimit
    var availableY   = canvasXLimit + srcTop; // srcTop thường ≥ 0
    var maxRowsFromY = Math.max(1, Math.floor(availableY / (artH + sp)));

    // --- Phân bổ tối ưu: chia đều totalCount cho các cột ---
    var idealRows    = Math.ceil(totalCount / maxCols);
    this._maxRows    = Math.min(Math.max(1, idealRows), maxRowsFromY);
    this._maxCols    = Math.ceil(totalCount / this._maxRows);
};

/**
 * Tính toán tọa độ cho artboard mới tại index
 * Grid layout adaptive — maxRows/maxCols được tính từ canvas bounds trong constructor.
 * @param {number} index - 0-based index
 * @returns {Array} - [left, top, right, bottom]
 */
CloneConfig.prototype.calculateNewArtboardRect = function (index) {
    var width  = Math.abs(this.sourceArtboardRect[2] - this.sourceArtboardRect[0]);
    var height = Math.abs(this.sourceArtboardRect[3] - this.sourceArtboardRect[1]);

    var itemIndex = index + 1; // bỏ qua artboard gốc
    var row = itemIndex % this._maxRows;
    var col = Math.floor(itemIndex / this._maxRows);

    var offsetX = (width  + this.artboardSpacing) * col;
    var offsetY = (height + this.artboardSpacing) * row;

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
