/**
 * @class MainTranslatorDialog
 * @description Quản lý giao diện chính theo quy trình 2 bước: Dịch -> Chọn Font.
 */
var MainTranslatorDialog = {
    // Dependencies
    coordinator: null,

    // State
    textItems: [],      // Danh sách text gốc
    fontList: [],       // Danh sách font hệ thống
    targetCols: [],     // Cấu hình các cột đích

    // UI Constants
    COL_WIDTH_ORIGINAL: 200,
    COL_WIDTH_TRANS: 200,
    ROW_HEIGHT: 30,

    init: function (coordinator) {
        this.coordinator = coordinator;
        return this;
    },

    show: function (textItems, fontList) {
        this.textItems = textItems;
        this.fontList = fontList || [];

        this.targetCols = [{
            langCode: 'vi',
            fontName: (this.fontList.length > 0) ? this.fontList[0].name : "Arial",
            translations: {}
        }];

        this.currentStep = 1;
        this.buildWindow();
    },

    buildWindow: function () {
        var self = this;
        this.window = new Window("dialog", "Auto Translate & Clone");
        this.window.orientation = "column";
        this.window.alignChildren = ["fill", "fill"];
        this.window.preferredSize = [850, 600];

        // Header
        var header = this.window.add("group");
        header.alignment = "fill";
        this.lblStep = header.add("statictext", undefined, "Step 1: Translate Content");
        this.lblStep.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);

        // Main Content (Dynamic)
        this.mainPanel = this.window.add("group");
        this.mainPanel.orientation = "column";
        this.mainPanel.alignChildren = ["fill", "fill"];
        this.mainPanel.alignment = ["fill", "fill"];

        // Footer
        var footer = this.window.add("group");
        footer.orientation = "row";
        footer.alignment = ["right", "bottom"];

        this.btnClose = footer.add("button", undefined, "Cancel");
        this.btnBack = footer.add("button", undefined, "< Back");
        this.btnAction = footer.add("button", undefined, "Translate");

        this.btnClose.onClick = function () { self.window.close(); };

        this.btnBack.onClick = function () {
            if (self.currentStep > 1) {
                self.currentStep--;
                self.renderCurrentStep();
            }
        };

        this.btnAction.onClick = function () {
            self.handleAction();
        };

        this.renderCurrentStep();
        this.window.show();
    },

    handleAction: function () {
        if (this.currentStep === 1) {
            this.currentStep = 2;
            this.renderCurrentStep();
        } else {
            this.window.close();
            if (this.coordinator) {
                this.coordinator.onFinish(this.textItems, this.targetCols);
            }
        }
    },

    renderCurrentStep: function () {
        // Xóa sạch con
        while (this.mainPanel.children.length > 0) {
            this.mainPanel.remove(this.mainPanel.children[0]);
        }

        if (this.currentStep === 1) {
            this.lblStep.text = "Step 1: Setup Languages & Translate";
            this.btnBack.enabled = false;
            this.btnAction.text = "Next: Select Fonts >";
            this.renderStep1_Translate(this.mainPanel);
        } else {
            this.lblStep.text = "Step 2: Assign Fonts & Review";
            this.btnBack.enabled = true;
            this.btnAction.text = "Finish (Clone)";
            this.renderStep2_Font(this.mainPanel);
        }

        this.window.layout.layout(true);
    },

    // --- STEP 1: TRANSLATE UI ---
    renderStep1_Translate: function (container) {
        var self = this;

        // 1. Toolbar
        var toolbar = container.add("group");
        toolbar.orientation = "row";
        toolbar.add("statictext", undefined, "Languages:");
        var btnAddCol = toolbar.add("button", undefined, "+ Add Language");

        // Mock Translate Button
        var btnMockTrans = toolbar.add("button", undefined, "⚡ Mock Translate");

        // 2. Grid Scroll View
        var gridScroll = container.add("panel", undefined, "");
        gridScroll.alignChildren = ["left", "top"];
        gridScroll.alignment = ["fill", "fill"];

        // --- HEADER ROW ---
        var headerGrp = gridScroll.add("group");
        headerGrp.orientation = "row";
        headerGrp.spacing = 10;

        // Col 1: Original Header
        var h1 = headerGrp.add("statictext", undefined, "Original Text");
        h1.preferredSize.width = this.COL_WIDTH_ORIGINAL;
        h1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

        // Dynamic Cols Headers
        for (var i = 0; i < this.targetCols.length; i++) {
            (function (colIndex) {
                var colGrp = headerGrp.add("group");
                colGrp.orientation = "row";
                colGrp.preferredSize.width = self.COL_WIDTH_TRANS;

                var dropLang = colGrp.add("dropdownlist", undefined, ["Vietnamese", "English", "Japanese", "French", "Korean"]);
                dropLang.selection = self.getLangIndex(self.targetCols[colIndex].langCode);
                dropLang.preferredSize.width = 150;

                var btnDel = colGrp.add("button", undefined, "X");
                btnDel.size = [25, 25];

                // Events
                dropLang.onChange = function () {
                    self.targetCols[colIndex].langCode = self.getLangCode(dropLang.selection.index);
                };
                btnDel.onClick = function () {
                    self.targetCols.splice(colIndex, 1);
                    self.renderCurrentStep();
                };
            })(i);
        }

        // --- DATA ROWS ---
        var maxRows = Math.min(this.textItems.length, 20);
        for (var r = 0; r < maxRows; r++) {
            var item = this.textItems[r];
            var rowGrp = gridScroll.add("group");
            rowGrp.orientation = "row";
            rowGrp.spacing = 10; // Match Header Spacing

            // Original Text Cell - Styled to be readable (not gray disabled)
            var orgCell = rowGrp.add("group");
            orgCell.preferredSize.width = this.COL_WIDTH_ORIGINAL;
            orgCell.preferredSize.height = this.ROW_HEIGHT;
            var txtOrg = orgCell.add("statictext", undefined, item.text, { truncate: "end" });
            txtOrg.preferredSize.width = this.COL_WIDTH_ORIGINAL - 16;
            txtOrg.graphics.foregroundColor = txtOrg.graphics.newPen(
                txtOrg.graphics.PenType.SOLID_COLOR, [0.9, 0.85, 0.7], 1  // Warm light color
            );
            txtOrg.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 12);

            // Trans Cells
            for (var c = 0; c < this.targetCols.length; c++) {
                (function (colIdx, rowItem) {
                    var transVal = self.targetCols[colIdx].translations[rowItem.id] || "";
                    var txtTrans = rowGrp.add("edittext", undefined, transVal);
                    txtTrans.preferredSize.width = self.COL_WIDTH_TRANS;
                    txtTrans.preferredSize.height = self.ROW_HEIGHT;

                    txtTrans.onChange = function () {
                        self.targetCols[colIdx].translations[rowItem.id] = txtTrans.text;
                    };
                })(c, item);
            }
        }

        // Actions
        btnAddCol.onClick = function () {
            self.targetCols.push({ langCode: 'en', fontName: (self.fontList.length > 0 ? self.fontList[0].name : 'Arial'), translations: {} });
            self.renderCurrentStep();
        };

        // Update button text to indicate real API usage
        btnMockTrans.text = "⚡ Translate via API";

        btnMockTrans.onClick = function () {
            // Check if user confirmed (simple check)
            // if (!confirm("Send data to local backend?")) return;

            try {
                // Call API for each target column
                for (var c = 0; c < self.targetCols.length; c++) {
                    var lang = self.targetCols[c].langCode;

                    // Call Batch Translation via UseCase (which uses Adapter)
                    // This returns map: { id: "translated text" }
                    var resultsMap = self.coordinator.translateBatch(self.textItems, "auto", lang);

                    // Apply to column data
                    for (var r = 0; r < self.textItems.length; r++) {
                        var itm = self.textItems[r];
                        if (resultsMap[itm.id]) {
                            // Update translation in memory
                            self.targetCols[c].translations[itm.id] = resultsMap[itm.id];
                        }
                    }
                }
                self.renderCurrentStep(); // Refresh UI to show translations

            } catch (e) {
                alert("Translation Error: " + e.message + "\n\nPlease ensure:\n1. Backend server is running (port 8000)\n2. Valid languages selected");
            }
        };
    },

    // --- STEP 2: FONT UI ---
    renderStep2_Font: function (container) {
        if (typeof FontSelectorView !== 'undefined') {
            FontSelectorView.render(container, this.textItems, this.targetCols, this.fontList);
        } else {
            container.add("statictext", undefined, "Error: FontSelectorView component not loaded.");
        }
    },

    // Helpers
    getLangIndex: function (code) {
        var map = { 'vi': 0, 'en': 1, 'ja': 2, 'fr': 3, 'ko': 4 };
        return map[code] !== undefined ? map[code] : 1;
    },

    getLangCode: function (index) {
        var codes = ['vi', 'en', 'ja', 'fr', 'ko'];
        return codes[index] || 'en';
    }
};
