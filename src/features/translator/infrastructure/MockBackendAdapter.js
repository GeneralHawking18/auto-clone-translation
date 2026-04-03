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
     * Fake translation request (tuần tự)
     */
    translate: function (job) {
        $.sleep(500); // Giả lập độ trễ mạng
        var result = { translations: [] };
        var lCode = job.langCode || job.targetLang || "UN";

        for (var i = 0; i < job.items.length; i++) {
            var item = job.items[i];
            if (item.isSelected !== false && item.isIncluded !== false) {
                result.translations.push({
                    id: item.id,
                    text: "[MOCK_" + lCode.toUpperCase() + "] " + item.text
                });
            }
        }
        return result;
    },

    /**
     * Fake parallel batch translation
     */
    translateBatchParallel: function (jobs) {
        $.sleep(1000); // Giả lập độ trễ xử lý song song
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
            responseMapByLang[job.langCode] = resultMap;
        }

        return responseMapByLang;
    }
};

// Initialize on load
MockBackendAdapter.init();
