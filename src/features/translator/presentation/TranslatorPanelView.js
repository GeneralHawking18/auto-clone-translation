/**
 * @class TranslatorPanelView
 * @description Renders Step 1: translation inputs.
 * Uses VirtualSlotGrid for performance.
 */
var TranslatorPanelView = {
    VISIBLE_COLS: 4,
    COL_WIDTH_ORIGINAL: 180,
    COL_WIDTH_TRANS: 190,
    ROW_HEIGHT: 28,

    render: function (container, coordinatorState, pullUseCase) {
        var self = this;
        var langLabels = LanguageConstants.getLabels();
        var langList   = LanguageConstants.getList();

        // ---- Toolbar ----
        var toolbar = container.add("group");
        toolbar.orientation = "row";
        toolbar.add("statictext", undefined, "Languages:");
        var btnAddCol    = toolbar.add("button", undefined, "+ Add Language");
        var btnPullSheet = toolbar.add("button", undefined, "Pull Sheet & Translate");

        // ---- Context URL ----
        var ctxGrp = container.add("group");
        ctxGrp.orientation = "row";
        ctxGrp.alignment   = ["fill", "top"];
        ctxGrp.add("statictext", undefined, "Context URL:");
        var txtContextUrl = ctxGrp.add("edittext", undefined, coordinatorState.contextUrl || "");
        txtContextUrl.preferredSize.width = 520;
        txtContextUrl.onChange = function () { coordinatorState.contextUrl = txtContextUrl.text; };

        // ---- Virtual Grid ----
        self.virtualGrid = new VirtualSlotGrid({
            container: container,
            visibleCols: self.VISIBLE_COLS,
            items: coordinatorState.textItems,
            columns: coordinatorState.targetCols,
            startPage: coordinatorState._translatorPage || 0,
            maxRows: 20,
            
            onRenderTopLeftHeader: function(parentGrp) {
                var h0 = parentGrp.add("statictext", undefined, "");
                h0.preferredSize.width = 22;
                var h1 = parentGrp.add("statictext", undefined, "Original Text");
                h1.preferredSize.width = self.COL_WIDTH_ORIGINAL;
                h1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
            },
            
            onRenderHeaderSlot: function(parentGrp) {
                var hg = parentGrp.add("group");
                hg.orientation = "row";
                hg.preferredSize.width = self.COL_WIDTH_TRANS;
                var hDrop = hg.add("dropdownlist", undefined, langLabels);
                hDrop.preferredSize.width = 148;
                var hDel = hg.add("button", undefined, "X");
                hDel.size = [22, 22];
                return { grp: hg, drop: hDrop, del: hDel };
            },
            
            onUpdateHeaderSlot: function(slot, colData, colIdx) {
                if (colData) {
                    var idx = LanguageConstants.getIndexByCode(colData.langCode);
                    slot.drop.onChange = null;
                    if (idx >= 0 && idx < slot.drop.items.length) {
                        slot.drop.selection = slot.drop.items[idx];
                    } else {
                        slot.drop.selection = slot.drop.items[0];
                    }
                    slot.grp.visible = true;
                    
                    (function (ci, dropRef, delRef) {
                        dropRef.onChange = function () {
                            if (dropRef.selection) {
                                coordinatorState.targetCols[ci].langCode = langList[dropRef.selection.index].code;
                            }
                        };
                        delRef.onClick = function () {
                            coordinatorState.targetCols.splice(ci, 1);
                            self.virtualGrid.setColumns(coordinatorState.targetCols);
                        };
                    })(colIdx, slot.drop, slot.del);
                } else {
                    slot.drop.onChange = null;
                    slot.grp.visible = false;
                }
            },
            
            onRenderRowHeader: function(parentGrp, item) {
                if (typeof item.isIncluded === 'undefined') item.isIncluded = true;
                var chk = parentGrp.add("checkbox", undefined, "");
                chk.value = item.isIncluded;
                chk.preferredSize.width = 22;
                
                (function (chkRef, itemRef) {
                    chkRef.onClick = function () { itemRef.isIncluded = chkRef.value; };
                })(chk, item);
                
                var orgCell = parentGrp.add("statictext", undefined, item.text, { truncate: "end" });
                orgCell.preferredSize.width  = self.COL_WIDTH_ORIGINAL;
                orgCell.preferredSize.height = self.ROW_HEIGHT;
                
                return { chk: chk, orgCell: orgCell };
            },
            
            onRenderDataSlot: function(parentGrp, item) {
                var cell = parentGrp.add("edittext", undefined, "");
                cell.preferredSize.width  = self.COL_WIDTH_TRANS;
                cell.preferredSize.height = self.ROW_HEIGHT;
                return { cell: cell };
            },
            
            onUpdateDataSlot: function(slot, item, colData, colIdx) {
                var cell = slot.cell;
                if (colData) {
                    var transVal = colData.translations[item.id] || "";
                    cell.text = transVal;
                    cell.visible = true;
                    
                    (function (ciRef, cellRef, itemRef) {
                        cellRef.onChange = function () {
                            coordinatorState.targetCols[ciRef].translations[itemRef.id] = cellRef.text;
                        };
                    })(colIdx, cell, item);
                } else {
                    cell.text = "";
                    cell.visible = false;
                }
            }
        });
        
        self.virtualGrid.build();

        var savePage = function() {
            coordinatorState._translatorPage = self.virtualGrid.getPage();
        };

        // Hook virtual grid events
        var oldPrev = self.virtualGrid.ui.btnPrev.onClick;
        self.virtualGrid.ui.btnPrev.onClick = function() { oldPrev(); savePage(); };
        var oldNext = self.virtualGrid.ui.btnNext.onClick;
        self.virtualGrid.ui.btnNext.onClick = function() { oldNext(); savePage(); };

        // Add Column
        btnAddCol.onClick = function () {
            coordinatorState.targetCols.push({
                langCode: 'en',
                fontName: (coordinatorState.fontList.length > 0 ? coordinatorState.fontList[0].name : 'Arial'),
                translations: {}
            });
            var newPage = Math.max(0, Math.ceil(coordinatorState.targetCols.length / self.VISIBLE_COLS) - 1);
            self.virtualGrid.setColumns(coordinatorState.targetCols);
            self.virtualGrid.setPage(newPage);
            savePage();
        };

        // Pull Sheet & Translate
        btnPullSheet.onClick = function () {
            try {
                if (!coordinatorState.contextUrl || coordinatorState.contextUrl.replace(/^\s+|\s+$/g, "") === "") {
                    alert("Please enter Google Sheets URL first.");
                    return;
                }
                if (!pullUseCase) { alert("Error: PullSheetUseCase not provided."); return; }

                var result = pullUseCase.execute({
                    contextUrl: coordinatorState.contextUrl,
                    textItems:  coordinatorState.textItems,
                    fontList:   coordinatorState.fontList
                });

                coordinatorState.targetCols = result.targetCols;

                for (var c = 0; c < coordinatorState.targetCols.length; c++) {
                    var cCode  = coordinatorState.targetCols[c].langCode;
                    var resMap = result.responseMap[cCode];
                    if (resMap) {
                        for (var ri = 0; ri < coordinatorState.textItems.length; ri++) {
                            var id = coordinatorState.textItems[ri].id;
                            if (resMap[id]) coordinatorState.targetCols[c].translations[id] = resMap[id];
                        }
                    }
                }

                self.virtualGrid.setColumns(coordinatorState.targetCols);
                self.virtualGrid.setPage(0);
                savePage();
                alert("Done! " + coordinatorState.targetCols.length + " languages loaded. Use Prev/Next to browse.");
            } catch (e) {
                alert("Error: " + e.message);
            }
        };
    }
};
