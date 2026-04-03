/**
 * @class VirtualSlotGrid
 * @description A reusable ScriptUI component for rendering a paginated grid with fixed columns.
 * Designed to prevent DOM-rebuilds by reusing slots and swapping data on navigation.
 */
var VirtualSlotGrid = function(config) {
    this.container      = config.container;
    this.visibleCols    = config.visibleCols || 4;
    this.items          = config.items || [];
    this.columns        = config.columns || [];
    this.maxRows        = config.maxRows || 20;

    // Callbacks
    this.onRenderTopLeftHeader = config.onRenderTopLeftHeader;
    this.onRenderHeaderSlot    = config.onRenderHeaderSlot;
    this.onUpdateHeaderSlot    = config.onUpdateHeaderSlot;
    
    this.onRenderRowHeader     = config.onRenderRowHeader;
    this.onRenderDataSlot      = config.onRenderDataSlot;
    this.onUpdateDataSlot      = config.onUpdateDataSlot;

    this._colPage = config.startPage || 0;

    this.ui = {
        btnPrev: null,
        btnNext: null,
        lblPage: null,
        navGrp: null,
        hSlots: [],
        rowSlots: []
    };
};

VirtualSlotGrid.prototype = {
    build: function() {
        var self = this;
        var V = self.visibleCols;

        // ---- Nav bar ----
        self.ui.navGrp = self.container.add("group");
        self.ui.navGrp.orientation = "row";
        
        self.ui.btnPrev = self.ui.navGrp.add("button", undefined, "< Prev");
        self.ui.btnPrev.preferredSize.width = 65;
        
        self.ui.lblPage = self.ui.navGrp.add("statictext", undefined, "");
        self.ui.lblPage.preferredSize.width = 180;
        
        self.ui.btnNext = self.ui.navGrp.add("button", undefined, "Next >");
        self.ui.btnNext.preferredSize.width = 65;

        // ---- Grid panel ----
        var gridPanel = self.container.add("panel", undefined, "");
        gridPanel.alignChildren = ["left", "top"];
        gridPanel.alignment = ["fill", "fill"];

        // ---- Header Row ----
        var headerGrp = gridPanel.add("group");
        headerGrp.orientation = "row";
        headerGrp.spacing = 6;

        if (typeof self.onRenderTopLeftHeader === 'function') {
            self.onRenderTopLeftHeader(headerGrp);
        }

        // Header Slots
        for (var s = 0; s < V; s++) {
            if (typeof self.onRenderHeaderSlot === 'function') {
                var slotObj = self.onRenderHeaderSlot(headerGrp);
                self.ui.hSlots.push(slotObj);
            }
        }

        // ---- Data Rows ----
        var rowCount = Math.min(self.items.length, self.maxRows);
        for (var r = 0; r < rowCount; r++) {
            var item = self.items[r];
            var rowGrp = gridPanel.add("group");
            rowGrp.orientation = "row";
            rowGrp.spacing = 6;

            var rowHeaderObj = null;
            if (typeof self.onRenderRowHeader === 'function') {
                rowHeaderObj = self.onRenderRowHeader(rowGrp, item);
            }

            var colCells = [];
            for (var s2 = 0; s2 < V; s2++) {
                if (typeof self.onRenderDataSlot === 'function') {
                    var cellObj = self.onRenderDataSlot(rowGrp, item);
                    colCells.push(cellObj);
                }
            }
            self.ui.rowSlots.push({ item: item, rowHeaderObj: rowHeaderObj, cells: colCells });
        }

        // Event Listeners
        self.ui.btnPrev.onClick = function() { self._colPage--; self.refresh(); };
        self.ui.btnNext.onClick = function() { self._colPage++; self.refresh(); };

        self.refresh();
        return self;
    },

    setColumns: function(newColumns) {
        this.columns = newColumns;
        this.refresh();
    },
    
    setPage: function(pageIndex) {
        this._colPage = pageIndex;
        this.refresh();
    },
    
    getPage: function() {
        return this._colPage;
    },

    refresh: function() {
        var self = this;
        var total = self.columns.length;
        var V = self.visibleCols;

        var maxPage = Math.max(0, Math.ceil(total / V) - 1);
        if (self._colPage > maxPage) self._colPage = maxPage;
        if (self._colPage < 0) self._colPage = 0;

        var start = self._colPage * V;
        var end = Math.min(start + V, total);

        self.ui.lblPage.text = "Lang " + (total > 0 ? start + 1 : 0) + "-" + end + " / " + total;
        self.ui.btnPrev.enabled = (self._colPage > 0);
        self.ui.btnNext.enabled = (self._colPage < maxPage);

        // Update Header Slots
        if (typeof self.onUpdateHeaderSlot === 'function') {
            for (var s = 0; s < V; s++) {
                var colIdx = start + s;
                var colData = (colIdx < total) ? self.columns[colIdx] : null;
                self.onUpdateHeaderSlot(self.ui.hSlots[s], colData, colIdx);
            }
        }

        // Update Data Slots
        if (typeof self.onUpdateDataSlot === 'function') {
            for (var r = 0; r < self.ui.rowSlots.length; r++) {
                var rs = self.ui.rowSlots[r];
                for (var s2 = 0; s2 < V; s2++) {
                    var colIdx2 = start + s2;
                    var colData2 = (colIdx2 < total) ? self.columns[colIdx2] : null;
                    self.onUpdateDataSlot(rs.cells[s2], rs.item, colData2, colIdx2);
                }
            }
        }
        
        // Force layout update if window object is accessible from container
        var w = self.container;
        while(w.parent) { w = w.parent; }
        if (w && w.layout && typeof w.layout.layout === 'function') {
            w.layout.layout(true);
        }
    }
};
