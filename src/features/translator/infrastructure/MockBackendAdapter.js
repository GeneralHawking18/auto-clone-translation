/**
 * @class MockBackendAdapter
 * @description Giả lập giao tiếp đa luồng với Python Backend cho mục đích kiểm thử UI.
 * Không thực sự gởi Request cấu hình mà trả về các chuỗi Text đã gắn flag [MOCK].
 */
var MockBackendAdapter = {
    init: function (silent) {
        return this; // No config needed
    },



    /**
     * Fake parallel batch translation — mirror PythonBackendAdapter contract:
     * key responseMap by String(rowId) khi job có rowId (banner flow).
     */
    translateBatchParallel: function (jobs) {
        $.sleep(1000); // Giả lập độ trễ
        var responseMapByLang = {};

        for (var j = 0; j < jobs.length; j++) {
            var job = jobs[j];
            var lCode = job.langCode || "UN";
            var resultMap = {};

            for (var i = 0; i < job.items.length; i++) {
                var item = job.items[i];
                var included = (item.isIncluded !== undefined) ? item.isIncluded : item.isSelected;
                if (included !== false) {
                    resultMap[item.id] = "[MOCK_" + lCode.toUpperCase() + "] " + item.text;
                }
            }

            var key = (job.rowId !== undefined && job.rowId !== null)
                ? job.rowId.toString()
                : job.langCode;
            responseMapByLang[key] = resultMap;
        }

        return responseMapByLang;
    }
};

// Initialize on load
MockBackendAdapter.init();
