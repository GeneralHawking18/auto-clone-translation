/**
 * @class WizardDialog
 * @description A generic UI container for multi-step flows.
 * Handles window creation, layout, and generic navigation buttons.
 */
var WizardDialog = function (config) {
    this.title = config.title || "Wizard";
    this.onBack = config.onBack;
    this.onNext = config.onNext;
    this.onCancel = config.onCancel;
    
    this._buildWindow();
};

WizardDialog.prototype = {
    _buildWindow: function() {
        var self = this;
        this.window = new Window("dialog", this.title);
        this.window.orientation   = "column";
        this.window.alignChildren = ["fill", "fill"];
        this.window.preferredSize = [1100, 620];

        // Header Title
        var header = this.window.add("group");
        header.alignment = "fill";
        this.lblStep = header.add("statictext", undefined, "Step");
        this.lblStep.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);

        // Main Content Area
        this.mainPanel = this.window.add("group");
        this.mainPanel.orientation  = "column";
        this.mainPanel.alignChildren = ["fill", "fill"];
        this.mainPanel.alignment    = ["fill", "fill"];

        // Footer Navigation
        var footer = this.window.add("group");
        footer.orientation = "row";
        footer.alignment   = ["right", "bottom"];

        this.btnClose  = footer.add("button", undefined, "Cancel");
        this.btnBack   = footer.add("button", undefined, "< Back");
        this.btnNext   = footer.add("button", undefined, "Next >");

        this.btnClose.onClick = function () { 
            if (self.onCancel) self.onCancel();
            self.window.close(); 
        };
        this.btnBack.onClick  = function () { if (self.onBack) self.onBack(); };
        this.btnNext.onClick  = function () { if (self.onNext) self.onNext(); };
    },

    getBodyContainer: function() {
        return this.mainPanel;
    },

    clearBody: function() {
        while (this.mainPanel.children.length > 0) {
            this.mainPanel.remove(this.mainPanel.children[0]);
        }
    },

    updateNavState: function(state) {
        if (typeof state.backEnabled !== 'undefined') this.btnBack.enabled = state.backEnabled;
        if (state.nextText) this.btnNext.text = state.nextText;
        if (state.titleText) this.lblStep.text = state.titleText;
        this.window.layout.layout(true);
    },

    show: function() {
        this.window.show();
    },

    close: function() {
        this.window.close();
    }
};
