/**
 * @class FontSelectorPanelView
 * @description Step 2 UI: Font selector cho tung ngon ngu.
 * Uses VirtualSlotGrid for optimal performance.
 */
var FontSelectorPanelView = {
    COL_WIDTH_ORIGINAL: 180,
    COL_WIDTH_TRANS: 190,
    VISIBLE_COLS: 4,

    render: function (container, coordinatorState) {
        var self      = this;
        var V         = self.VISIBLE_COLS;
        
        var textItems = coordinatorState.textItems;
        var targetCols = coordinatorState.targetCols;
        var fontList = coordinatorState.fontList;

        // Filter active items only for Step 2
        var activeItems = [];
        for (var i = 0; i < textItems.length; i++) {
            if (textItems[i].isIncluded !== false) {
                activeItems.push(textItems[i]);
            }
        }

        // ---- Virtual Grid ----
        self.virtualGrid = new VirtualSlotGrid({
            container: container,
            visibleCols: self.VISIBLE_COLS,
            items: activeItems,
            columns: targetCols,
            startPage: coordinatorState._fontPage || 0,
            
            onRenderTopLeftHeader: function(parentGrp) {
                var hLabel = parentGrp.add("statictext", undefined, "Font Settings >");
                hLabel.preferredSize.width  = self.COL_WIDTH_ORIGINAL;
                hLabel.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
            },
            
            onRenderHeaderSlot: function(parentGrp) {
                var colGrp = parentGrp.add("group");
                colGrp.orientation  = "column";
                colGrp.preferredSize.width = self.COL_WIDTH_TRANS;
                colGrp.alignChildren = ["left", "top"];

                var lbl = colGrp.add("statictext", undefined, "");
                lbl.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);
                lbl.preferredSize.width = self.COL_WIDTH_TRANS;

                var ctrlGrp = colGrp.add("group");
                ctrlGrp.orientation = "row";
                ctrlGrp.spacing = 2;

                var fontDrop = ctrlGrp.add("dropdownlist", undefined, []);
                fontDrop.preferredSize.width = 150;

                var btnSearch = ctrlGrp.add("button", undefined, "F");
                btnSearch.preferredSize.width = 25;

                return { grp: colGrp, lbl: lbl, drop: fontDrop, search: btnSearch };
            },
            
            onUpdateHeaderSlot: function(slot, colData, colIdx) {
                if (colData) {
                    var langName = (typeof LanguageConstants !== 'undefined')
                        ? LanguageConstants.getName(colData.langCode)
                        : colData.langCode;

                    slot.lbl.text  = langName;
                    slot.grp.visible = true;
                    
                    slot.drop.onChange = null;
                    slot.search.onClick = null;
                    slot.drop.removeAll();
                    if (colData.fontName) { slot.drop.add("item", colData.fontName); }
                    else { slot.drop.add("item", "Arial"); }
                    
                    var limit = Math.min(fontList.length, 50);
                    for (var f = 0; f < limit; f++) {
                        if (fontList[f].name !== colData.fontName) slot.drop.add("item", fontList[f].name);
                    }
                    slot.drop.selection = 0;

                    (function (ciRef, dropRef, searchRef) {
                        dropRef.onChange = function () {
                            if (dropRef.selection) targetCols[ciRef].fontName = dropRef.selection.text;
                        };
                        searchRef.onClick = function () {
                            if (typeof FontSearchDialog !== 'undefined') {
                                var result = FontSearchDialog.show(fontList);
                                if (result) {
                                    targetCols[ciRef].fontName = result;
                                    self.virtualGrid.refresh(); // forces update
                                }
                            } else {
                                alert("FontSearchDialog not loaded");
                            }
                        };
                    })(colIdx, slot.drop, slot.search);

                } else {
                    slot.grp.visible = false;
                }
            },
            
            onRenderRowHeader: function(parentGrp, item) {
                var txtOrg = parentGrp.add("statictext", undefined, item.text, { truncate: "end" });
                txtOrg.preferredSize.width  = self.COL_WIDTH_ORIGINAL;
                txtOrg.preferredSize.height = 24;
                return { txtOrg: txtOrg };
            },
            
            onRenderDataSlot: function(parentGrp, item) {
                var cellGrp = parentGrp.add("group");
                cellGrp.orientation  = "row";
                cellGrp.spacing      = 2;
                cellGrp.preferredSize.width = self.COL_WIDTH_TRANS;

                var chk = cellGrp.add("checkbox", undefined, "");
                chk.preferredSize.width = 22;

                var txtTrans = cellGrp.add("statictext", undefined, "", { truncate: "end" });
                txtTrans.preferredSize.width = self.COL_WIDTH_TRANS - 26;

                return { grp: cellGrp, chk: chk, txt: txtTrans };
            },
            
            onUpdateDataSlot: function(slot, item, colData, colIdx) {
                if (colData) {
                    if (!colData.fontAppliedMap) colData.fontAppliedMap = {};
                    if (typeof colData.fontAppliedMap[item.id] === 'undefined') {
                        var tv  = colData.translations[item.id] || "";
                        var isIdeo = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]/.test(tv);
                        colData.fontAppliedMap[item.id] = isIdeo;
                    }

                    var val = colData.translations[item.id] || "(empty)";
                    slot.txt.text = val.length > 22 ? val.substring(0, 19) + "..." : val;
                    
                    slot.chk.onClick = null;
                    slot.chk.value = colData.fontAppliedMap[item.id];
                    slot.grp.visible = true;

                    (function (ciRef, chkRef, itemRef) {
                        chkRef.onClick = function () {
                            targetCols[ciRef].fontAppliedMap[itemRef.id] = chkRef.value;
                        };
                    })(colIdx, slot.chk, item);

                } else {
                    slot.txt.text = "";
                    slot.grp.visible = false;
                }
            }
        });

        self.virtualGrid.build();

        var savePage = function() {
            coordinatorState._fontPage = self.virtualGrid.getPage(); 
        };
        var oldPrev = self.virtualGrid.ui.btnPrev.onClick;
        self.virtualGrid.ui.btnPrev.onClick = function() { oldPrev(); savePage(); };
        var oldNext = self.virtualGrid.ui.btnNext.onClick;
        self.virtualGrid.ui.btnNext.onClick = function() { oldNext(); savePage(); };
    }
};
