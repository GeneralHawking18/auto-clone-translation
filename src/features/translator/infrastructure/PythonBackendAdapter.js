/**
 * @class PythonBackendAdapter
 * @description Handles communication with the Python Backend Service using cURL.
 */
var PythonBackendAdapter = {
    baseUrl: "http://localhost:8510",
    apiKey: null,

    /**
     * Initialize adapter - load config from installer-created file
     * @returns {PythonBackendAdapter} this
     */
    init: function (silent) {
        // Read from config file in User AppData (no admin required)
        // Windows: C:\Users\<username>\AppData\Roaming\Auto Clone Translation\api_config.json
        // Note: Folder.userData = AppData\Roaming, Folder.appData = ProgramData
        var configPath = Folder.userData + "/Auto Clone Translation/api_config.json";
        var configFile = new File(configPath);

        if (configFile.exists) {
            configFile.open("r");
            configFile.encoding = "UTF-8";
            var content = configFile.read();
            configFile.close();
            try {
                var config = JSON.parse(content);
                this.apiKey = config.apiKey || null;
                if (config.backendUrl) {
                    this.baseUrl = config.backendUrl;
                }
            } catch (e) {
                if (!silent) {
                    alert("Error reading config file: " + e.message);
                }
            }
        } else {
            // Config does not exist - only show alert on first load
            if (!silent) {
                alert("Config file not found.\nPlease reinstall the extension.");
            }
        }

        return this;
    },

    /**
     * Giao tiếp ngầm đồng thời đa luồng bằng 1 batch request duy nhất.
     * @param {Array} jobs - Mảng cấu hình các request dịch cho từng targetLang.
     * @returns {Object} { "langCode1": { "id": "text" }, "langCode2": ... }
     */
    translateBatchParallel: function (jobs) {
        this.init(true);

        if (!this.apiKey) {
            throw new Error("API Key not configured.\nPlease reinstall the extension.");
        }

        if (!jobs || jobs.length === 0) {
            return {};
        }

        var tempFolder = Folder.temp;
        var batchTimestamp = new Date().getTime();
        var filesToCleanup = [];
        var responseMapByLang = {};
        var pivotImageName = "";

        // 1. Khởi tạo Payload cho /api/v1/document/extract-banner
        var contextUrl = jobs[0].contextUrl;
        if (!contextUrl) {
            throw new Error("Sheet URL bắt buộc — vui lòng nhập Google Sheets URL trước khi dịch.");
        }
        var endpoint = this.baseUrl + "/api/v1/document/extract-banner";

        var payload = {
            source_lang: jobs[0].sourceLang || "auto",
            sheet_url: contextUrl,
            translation_type: jobs[0].translationType || "extractor",
            items: []
        };
        if (jobs[0].projectId) {
            payload.project_id = jobs[0].projectId;
        }

        // Init responseMap theo row_id (response key bằng str(row_id))
        for (var j = 0; j < jobs.length; j++) {
            responseMapByLang[jobs[j].rowId.toString()] = {};
        }

        // Lấy list items từ job đầu tiên (vì tất cả job đều chung 1 list textItems)
        var sourceItems = jobs[0].items || [];

        // Duplicate items per row — mỗi item gắn row_id của ngôn ngữ tương ứng
        for (var k = 0; k < jobs.length; k++) {
            var currentJob = jobs[k];
            for (var i = 0; i < sourceItems.length; i++) {
                var included = (sourceItems[i].isIncluded !== undefined) ? sourceItems[i].isIncluded : sourceItems[i].isSelected;
                if (included !== false) {
                    var layerName = sourceItems[i].layerName || "";
                    var isBtn = layerName.toLowerCase().indexOf('btn') > -1 || layerName.toLowerCase().indexOf('button') > -1;
                    payload.items.push({
                        id: sourceItems[i].id,
                        text: sourceItems[i].text,
                        row_id: currentJob.rowId,
                        layer_name: layerName,
                        is_button: isBtn
                    });
                }
            }
        }

        if (payload.items.length === 0) {
            return responseMapByLang; // Không có text để dịch
        }

        // 2. Ghi file Request
        var suffix = "_" + batchTimestamp;
        var reqFile = new File(tempFolder + "/req_batch" + suffix + ".json");
        var resFile = new File(tempFolder + "/res_batch" + suffix + ".json");
        var batFile = new File(tempFolder + "/run_batch" + suffix + ".bat");
        var vbsFile = new File(tempFolder + "/run_silent_batch" + suffix + ".vbs");

        filesToCleanup.push(reqFile, resFile, batFile, vbsFile);

        reqFile.open("w");
        reqFile.encoding = "UTF-8";
        reqFile.write(JSON.stringify(payload));
        reqFile.close();

        // 3. Tạo file BAT và VBS, gọi cURL
        var cmd = 'curl -s -k -X POST "' + endpoint + '"';
        cmd += ' -H "Content-Type: application/json"';
        cmd += ' -H "X-API-Key: ' + this.apiKey + '"';
        cmd += ' -d "@' + reqFile.fsName + '"';
        cmd += ' -o "' + resFile.fsName + '"';

        batFile.open("w");
        batFile.write('@echo off\n' + cmd + '\nexit\n');
        batFile.close();

        vbsFile.open("w");
        vbsFile.write('Set WshShell = CreateObject("WScript.Shell")\n');
        vbsFile.write('WshShell.Run chr(34) & "' + batFile.fsName + '" & chr(34), 0, False\n');
        vbsFile.close();

        vbsFile.execute();

        // 4. Polling chờ kết quả
        var maxWaitLoops = 300; // max timeout 30s
        var completed = false;

        while (maxWaitLoops > 0) {
            if (resFile.exists && resFile.length > 0) {
                try {
                    if (resFile.open("r")) {
                        resFile.close();
                        completed = true;
                        break;
                    }
                } catch (errWait) { }
            }
            $.sleep(100);
            maxWaitLoops--;
        }

        // 5. Parse dữ liệu trả về theo Dictonary Scheme
        if (completed && resFile.exists && resFile.length > 0) {
            resFile.open("r");
            resFile.encoding = "UTF-8";
            var bodyStr = resFile.read();
            resFile.close();

            try {
                var parsedObj = JSON.parse(bodyStr);
                if (parsedObj) {
                    if (parsedObj.detail) {
                        // FastAPI validation errors are arrays
                        if (parsedObj.detail instanceof Array) {
                            var errMsg = [];
                            for (var e = 0; e < parsedObj.detail.length; e++) {
                                var err = parsedObj.detail[e];
                                var loc = err.loc ? err.loc.join("->") : "";
                                errMsg.push(loc + ": " + err.msg);
                            }
                            throw new Error("API Validation Error:\n" + errMsg.join("\n"));
                        } else if (parsedObj.detail.code === "MISSING_API_KEY" || parsedObj.detail.code === "INVALID_API_KEY") {
                            throw new Error("Invalid API Key in Batch Mode.\nContact Admin to get a new key.");
                        } else if (typeof parsedObj.detail === "string") {
                            throw new Error("API Error: " + parsedObj.detail);
                        } else if (parsedObj.detail.message) {
                            throw new Error("API Error: " + parsedObj.detail.message);
                        } else {
                            throw new Error("API Error: " + JSON.stringify(parsedObj.detail));
                        }
                    }
                    
                    if (parsedObj.pivot_image_name) {
                        pivotImageName = parsedObj.pivot_image_name;
                    }

                    if (parsedObj.translations) {
                        for (var key in parsedObj.translations) {
                            if (parsedObj.translations.hasOwnProperty(key)) {
                                var lCode = key; // for contextUrl, key is row_id. For standard, key is langCode
                                var tArray = parsedObj.translations[key];
                                var resultMap = {};
                                for (var tn = 0; tn < tArray.length; tn++) {
                                    var tItem = tArray[tn];
                                    if (tItem.id && tItem.text) {
                                        resultMap[tItem.id] = tItem.text;
                                    }
                                }
                                responseMapByLang[lCode] = resultMap;
                            }
                        }
                    }
                }
            } catch (pe) {
                // Ignore parsing errors and keep returning what we have
                if (pe.message && (pe.message.indexOf("API Key") >= 0 || pe.message.indexOf("API Error") >= 0 || pe.message.indexOf("API Validation Error") >= 0)) {
                    // Cleanup files before throwing
                    for (var cx = 0; cx < filesToCleanup.length; cx++) {
                        if (filesToCleanup[cx].exists) filesToCleanup[cx].remove();
                    }
                    throw pe;
                }
                
                // If it's a JSON parse error, throw it so user knows the backend returned garbage
                for (var cx = 0; cx < filesToCleanup.length; cx++) {
                    if (filesToCleanup[cx].exists) filesToCleanup[cx].remove();
                }
                var shortBody = bodyStr.length > 200 ? bodyStr.substring(0, 200) + "..." : bodyStr;
                throw new Error("Invalid response from Backend:\n" + shortBody);
            }
        } else {
            // Timeout hoặc file không tồn tại
            // Throw error but delete files first or use finally block. Since ExtendScript doesn't have finally block always cleanly, 
            // We just duplicate cleanup here
            for (var x = 0; x < filesToCleanup.length; x++) {
                if (filesToCleanup[x].exists) {
                    filesToCleanup[x].remove();
                }
            }
            throw new Error("Batch translation timed out or failed to response. The backend server might be unresponsive or taking longer than 60 seconds.");
        }

        // 6. Dọn dẹp File
        for (var x = 0; x < filesToCleanup.length; x++) {
            if (filesToCleanup[x].exists) {
                filesToCleanup[x].remove();
            }
        }

        return {
            responseMap: responseMapByLang,
            pivotImageName: pivotImageName
        };
    }
};

// Note: PythonBackendAdapter.init() is called explicitly by host_app.jsx (DI pattern)
