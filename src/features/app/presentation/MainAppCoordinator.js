/**
 * @class MainAppCoordinator
 * @description Orchestrates the app flow from extractor -> font discovery -> translate -> select fonts -> clone.
 */
var MainAppCoordinator = {
    init: function (config) {
        this.extractUseCase = config.extractUseCase;
        this.fontUseCase = config.fontUseCase;
        this.pullTranslationUseCase = config.pullTranslationUseCase;
        this.cloneUseCase = config.cloneUseCase;
        return this;
    },

    start: function () {
        // Step A: Extract
        this.textItems = this.extractUseCase.execute();
        if (!this.textItems || this.textItems.length === 0) {
            alert("No text found in selection! Please select objects containing text.");
            return;
        }

        // Step B: Fonts
        this.fontList = this.fontUseCase.execute();

        // Init State
        this.contextUrl = "";
        this.targetCols = [{
            langCode: 'en',
            fontName: this.fontList.length > 0 ? this.fontList[0].name : "Arial",
            translations: {}
        }];

        var self = this;
        this.currentStep = 1;

        // Create Wizard Container
        this.wizard = new WizardDialog({
            title: "Auto Translate & Clone",
            onBack: function() { 
                if (self.currentStep > 1) { 
                    self.currentStep--; 
                    self.renderStep(); 
                } 
            },
            onNext: function() {
                if (self.currentStep === 1) {
                    if (typeof FontService !== 'undefined' && typeof FontService.applyDefaultFontsToTargets === 'function') {
                        FontService.applyDefaultFontsToTargets(self.textItems, self.targetCols);
                    }
                    self.currentStep++;
                    self.renderStep();
                } else if (self.currentStep === 2) {
                    self.wizard.close();
                    try {
                        self.cloneUseCase.execute(self.textItems, self.targetCols);
                        var totalLangs = self.targetCols.length;
                        alert("Success! Created clones for " + totalLangs + " language(s).");
                    } catch (e) {
                        alert("Error during cloning: " + e.message);
                    }
                }
            }
        });

        this.renderStep();
        this.wizard.show();
    },

    renderStep: function () {
        this.wizard.clearBody();
        if (this.currentStep === 1) {
            this.wizard.updateNavState({ 
                backEnabled: false, 
                titleText: "Step 1: Setup Languages & Translate",
                nextText: "Next: Select Fonts >" 
            });
            if (typeof TranslatorPanelView !== 'undefined') {
                TranslatorPanelView.render(this.wizard.getBodyContainer(), this, this.pullTranslationUseCase);
            } else {
                this.wizard.getBodyContainer().add("statictext", undefined, "Error: TranslatorPanelView not loaded");
            }
        } else {
            this.wizard.updateNavState({ 
                backEnabled: true, 
                titleText: "Step 2: Assign Fonts & Review",
                nextText: "Finish (Clone)" 
            });
            if (typeof FontSelectorPanelView !== 'undefined') {
                FontSelectorPanelView.render(this.wizard.getBodyContainer(), this);
            } else {
                this.wizard.getBodyContainer().add("statictext", undefined, "Error: FontSelectorPanelView not loaded");
            }
        }
    }
};
