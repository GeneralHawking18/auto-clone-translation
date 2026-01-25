/**
 * @class ExtractSelectedTextUseCase
 * @description Coordinate the extraction of text from current selection.
 */
var ExtractSelectedTextUseCase = {
    repository: null,

    init: function (repository) {
        this.repository = repository;
        return this;
    },

    /**
     * Executes the use case
     * @returns {Array<TextItem>}
     */
    execute: function () {
        if (!this.repository) {
            throw new Error("Repository not initialized in ExtractSelectedTextUseCase");
        }

        var items = this.repository.getSelectedTextItems();

        // Additional business logic could go here (e.g. max items limit, filtering by pattern)

        return items;
    }
};
