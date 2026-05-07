/**
 * @class PullSheetAndTranslateUseCase
 * @layer Application
 *
 * Schema Sheet thuc te:
 *   Row 0: Ngon ngu | Ten anh | element_1 | element_2 | ...
 *   Row 1: VI       | abc.jpg | Luyen tap | Mo khoa   | ...
 *
 * Flow:
 *   1. Keo Sheet -> adapter tra ve { configs, elementIds, responseMap }
 *   2. Map elementIds -> textItem.id (khop theo ten layer hoac thu tu)
 *   3. Tra ve { targetCols[], responseMap{} } cho Presentation
 *
 * NOTE: Voi schema nay, ban dich da co san trong Sheet.
 *       Khong can goi backend API de dich nua.
 *       Backend chi duoc goi neu elementId khong co ban dich trong Sheet.
 */
var PullSheetAndTranslateUseCase = {

    sheetAdapter: null,
    backendAdapter: null,

    init: function (sheetAdapter, backendAdapter) {
        this.sheetAdapter = sheetAdapter;
        this.backendAdapter = backendAdapter;
        return this;
    },

    execute: function (command) {
        if (!this.sheetAdapter || !this.backendAdapter) {
            throw new Error("PullSheetAndTranslateUseCase: Adapters not initialized.");
        }

        // -------------------------------------------------------------- //
        // 1. Keo danh sach Ngon Ngu tu Google Sheet                       //
        // -------------------------------------------------------------- //
        var sheetData = this.sheetAdapter.fetchContext(command.contextUrl);

        if (!sheetData.configs || sheetData.configs.length === 0) {
            throw new Error(
                "Sheet CSV empty or wrong format.\n" +
                "Expected: Col A = Language code (VI/EN...), Col B = Image name."
            );
        }

        var textItems = command.textItems || [];
        var fontList = command.fontList || [];
        var fallbackFont = (fontList.length > 0) ? fontList[0].name : "Arial";

        // -------------------------------------------------------------- //
        // 2. Xay dung targetCols va Jobs                                  //
        // -------------------------------------------------------------- //
        var targetCols = [];
        var translationJobs = [];

        for (var c = 0; c < sheetData.configs.length; c++) {
            var conf = sheetData.configs[c];

            // Build UI columns
            targetCols.push({
                langCode: conf.langCode,
                namePicture: conf.namePicture,
                fontName: "", // Trống để FontService.applyDefaultFontsToTargets tự quyết định (như NotoSans)
                translations: {},
                rowId: conf.rowId
            });

            // Lấy tên ngôn ngữ dài cho target_lang
            var targetLangName = "Unknown";
            if (typeof LanguageConstants !== "undefined") {
                targetLangName = LanguageConstants.getName(conf.langCode);
            } else {
                targetLangName = conf.langCode;
            }

            // Build Job for API
            translationJobs.push({
                sourceLang: "auto",
                targetLang: targetLangName,
                langCode: conf.langCode,
                rowId: conf.rowId,
                contextUrl: command.contextUrl,
                items: textItems
            });
        }

        // -------------------------------------------------------------- //
        // 3. Ban API dong thoi lay ket qua (ResponseMap)                  //
        // -------------------------------------------------------------- //
        var responseMapByLang = {};
        var pivotImageName = "";
        if (translationJobs.length > 0) {
            var batchResult = this.backendAdapter.translateBatchParallel(translationJobs);
            responseMapByLang = batchResult.responseMap;
            pivotImageName = batchResult.pivotImageName || "";
        }

        // -------------------------------------------------------------- //
        // 4. Tra ve cho Presentation                                      //
        // -------------------------------------------------------------- //

        // Bỏ cột nguồn (source language row): server không trả translation
        // → responseMapByLang[rowId] sẽ là {} rỗng.
        // Chỉ giữ cột nào thực sự có dữ liệu dịch.
        // NOTE: dùng for-in thay Object.keys vì ExtendScript là ES3
        var validTargetCols = [];
        for (var v = 0; v < targetCols.length; v++) {
            var col = targetCols[v];
            var key = col.rowId ? col.rowId.toString() : col.langCode;
            var colData = responseMapByLang[key];
            var hasData = false;
            if (colData) {
                for (var k in colData) {
                    if (colData.hasOwnProperty(k)) { hasData = true; break; }
                }
            }
            if (hasData) {
                validTargetCols.push(col);
            }
        }

        return {
            targetCols: validTargetCols,
            responseMap: responseMapByLang,
            pivotImageName: pivotImageName
        };
    }
};
