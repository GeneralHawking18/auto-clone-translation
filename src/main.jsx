/**
 * Module điều khiển luồng chính của ứng dụng
 * @namespace
 */
var App = {
    // Dependencies (injected via init)
    _aiService: null,
    _csvService: null,
    _uiService: null,
    _config: null,
    _utils: null,

    /**
     * Khởi tạo App với dependencies
     * @param {Object} aiService - AIService
     * @param {Object} csvService - CSVService
     * @param {Object} uiService - UIService
     * @param {Object} utils - Utils
     * @param {Object} config - CONFIG
     */
    init: function (aiService, csvService, uiService, utils, config) {
        this._aiService = aiService;
        this._csvService = csvService;
        this._uiService = uiService;
        this._utils = utils;
        this._config = config;
        return this;
    },

    /**
     * Chạy ứng dụng
     */
    run: function () {
        try {
            // Bước 1: Lấy template
            var templateGroup = this._aiService.getSelectedTemplate();

            // Bước 2: Lấy nguồn dữ liệu
            var csvFile = this._getDataSource();
            if (!csvFile) return;

            // Bước 3: Parse và xác nhận
            var csvData = this._csvService.parse(csvFile);
            var mappingInfo = this._aiService.analyzeMapping(
                templateGroup,
                csvData.headers,
                csvData.referenceMap,
                csvData.dataRows
            );

            if (!this._uiService.showConfirmDialog(templateGroup.name, csvData.rows.length, mappingInfo)) {
                return;
            }

            // Bước 4: Safe Save & Tạo clones
            app.activeDocument.save();
            var created = this._createClones(templateGroup, csvData);

            // Bước 5: Refresh màn hình
            this._aiService.forceRefresh(templateGroup);

            // Hoàn thành
            alert("Xong rồi đấy! Đã xử lý " + created + " bản.");

        } catch (e) {
            alert("❌ LỖI: " + e.message);
        }
    },

    /**
     * Lấy nguồn dữ liệu
     * @returns {File|null}
     * @private
     */
    _getDataSource: function () {
        var source = this._uiService.showInputWindow();
        if (!source) return null;

        if (source.type === "url") {
            return this._csvService.download(source.data);
        }

        return source.data;
    },

    /**
     * Tạo các bản clone
     * @param {GroupItem} templateGroup
     * @param {Object} csvData
     * @returns {number} Số bản đã tạo
     * @private
     */
    _createClones: function (templateGroup, csvData) {
        app.activeDocument.selection = null;
        var created = 0;

        for (var i = 0; i < csvData.rows.length; i++) {
            var line = csvData.rows[i];
            if (!line || line.replace(/\s+/g, "") === "") continue;

            var values = line.split(csvData.separator);
            var dict = {};

            for (var k = 0; k < csvData.headers.length; k++) {
                dict[csvData.headers[k]] = this._utils.trim(this._utils.safeGet(values, k, ""));
            }

            this._aiService.createClone(templateGroup, created, dict, csvData.referenceMap);
            created++;

            // Redraw định kỳ
            if (created % this._config.REDRAW_INTERVAL === 0) {
                app.redraw();
            }
        }

        return created;
    }
};

// ============================================================================
// COMPOSITION ROOT - Wire up all dependencies
// ============================================================================

// Initialize services with their dependencies
ClipboardService.init(Utils, CONFIG);
CSVService.init(Utils, CONFIG);
FontService.init(Utils);
AIService.init(FontService, Utils, CONFIG);
UIService.init(ClipboardService, FontService, Utils, CONFIG);

// Initialize App with all services
App.init(AIService, CSVService, UIService, Utils, CONFIG);

// Run the application
App.run();
