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

        // Col 0: Checkbox Header (Empty or "All")
        var h0 = headerGrp.add("statictext", undefined, "All");
        h0.preferredSize.width = 25;

        // Col 1: Original Header
        var h1 = headerGrp.add("statictext", undefined, "Original Text");
        h1.preferredSize.width = this.COL_WIDTH_ORIGINAL;
        h1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

        // Dynamic Cols Headers
        // Sử dụng LanguageConstants để lấy danh sách nhãn
        var langLabels = LanguageConstants.getLabels();
        var langList = LanguageConstants.getList();

        for (var i = 0; i < this.targetCols.length; i++) {
            (function (colIndex) {
                var colGrp = headerGrp.add("group");
                colGrp.orientation = "row";
                colGrp.preferredSize.width = self.COL_WIDTH_TRANS;

                var dropLang = colGrp.add("dropdownlist", undefined, langLabels);
                // Tìm index dựa trên code hiện tại hoặc default
                var currentCode = self.targetCols[colIndex].langCode;
                var idx = LanguageConstants.getIndexByCode(currentCode);
                dropLang.selection = idx;

                dropLang.preferredSize.width = 150;

                var btnDel = colGrp.add("button", undefined, "X");
                btnDel.size = [25, 25];

                // Events
                dropLang.onChange = function () {
                    // Cập nhật code và name vào targetCols
                    var selectedLang = langList[dropLang.selection.index];
                    self.targetCols[colIndex].langCode = selectedLang.code;
                    // Lưu ý: Backend bây giờ sẽ nhận 'name' làm target_lang, nhưng ta vẫn giữ code ở object config
                    // Việc chuyển đổi sang name sẽ làm ở tầng Service/UseCase
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
            (function (r) {
                var item = self.textItems[r];
                // Ensure isIncluded property exists
                if (typeof item.isIncluded === 'undefined') item.isIncluded = true;

                var rowGrp = gridScroll.add("group");
                rowGrp.orientation = "row";
                rowGrp.spacing = 10; // Match Header Spacing

                // Col 0: Checkbox
                var chkInclude = rowGrp.add("checkbox", undefined, "");
                chkInclude.value = item.isIncluded;
                chkInclude.preferredSize.width = 25;

                // Original Text Cell
                var orgCell = rowGrp.add("group");
                orgCell.preferredSize.width = self.COL_WIDTH_ORIGINAL;
                orgCell.preferredSize.height = self.ROW_HEIGHT;
                var txtOrg = orgCell.add("statictext", undefined, item.text, { truncate: "end" });
                txtOrg.preferredSize.width = self.COL_WIDTH_ORIGINAL - 16;
                txtOrg.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 12);

                // Helper to update visual state based on checkbox
                var updateVisualState = function () {
                    item.isIncluded = chkInclude.value;
                    txtOrg.enabled = item.isIncluded;
                    // Disable/Gray out content
                    // Note: ScriptUI statictext disabled state appearance varies, but usually gray
                };
                updateVisualState();

                chkInclude.onClick = function () {
                    updateVisualState();
                    // Disable translation inputs for this row
                    // (Simpler to just re-render or let the edittext logic handle it, 
                    // but for performance we can iterate children if needed. 
                    // For now, visual feedback on Original Text is enough)
                };

                // Trans Cells
                for (var c = 0; c < self.targetCols.length; c++) {
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
            })(r);
        }

        // Actions
        btnAddCol.onClick = function () {
            // Default new column to English
            self.targetCols.push({ langCode: 'en', fontName: (self.fontList.length > 0 ? self.fontList[0].name : 'Arial'), translations: {} });
            self.renderCurrentStep();
        };

        // Update button text to indicate real API usage
        btnMockTrans.text = "⚡ Translate via API";

        btnMockTrans.onClick = function () {
            try {
                // Call API for each target column
                for (var c = 0; c < self.targetCols.length; c++) {
                    var langCode = self.targetCols[c].langCode;
                    // Convert Code -> Full Name for Backend
                    var langName = LanguageConstants.getName(langCode);

                    // Create a subset of items that are checked (isIncluded == true)
                    // We don't remove them from main list, just filter for API call
                    var itemsToTranslate = [];
                    for (var r = 0; r < self.textItems.length; r++) {
                        if (self.textItems[r].isIncluded) {
                            itemsToTranslate.push(self.textItems[r]);
                        }
                    }

                    if (itemsToTranslate.length === 0) {
                        continue;
                    }

                    // Call Batch Translation via UseCase
                    // PASSING FULL LANGUAGE NAME HERE
                    var resultsMap = self.coordinator.translateBatch(itemsToTranslate, "auto", langName);

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
            // Filter out unchecked items for Step 2 View if desired, 
            // or just let FontSelectorView handle them (display all but maybe visually dim).
            // For now, we pass all, but FontSelectorView logic might need update if we want to hide them.
            // Let's filter strictly for cleaner UI.
            var activeItems = [];
            for (var i = 0; i < this.textItems.length; i++) {
                if (this.textItems[i].isIncluded !== false) { // Default true
                    activeItems.push(this.textItems[i]);
                }
            }
            FontSelectorView.render(container, activeItems, this.targetCols, this.fontList);
        } else {
            container.add("statictext", undefined, "Error: FontSelectorView component not loaded.");
        }
    },

    // Helpers
    // Removed old getLangIndex/getLangCode as we use LanguageConstants now
};
