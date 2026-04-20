/**
 * @class PythonBackendAdapter
 * @description Handles communication with the Python Backend Service using cURL.
 */
var PythonBackendAdapter = {
    baseUrl: "http://192.168.11.108:8510",
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
     * Send translation request to backend
     * @param {TranslationJob} job
     * @returns {Object} Response JSON
     */
    translate: function (job) {
        // Auto-reload config before each API call (allows hot-reload without restart)
        this.init(true);

        // Check API key (entered during installation)
        if (!this.apiKey) {
            throw new Error("API Key not configured.\nPlease reinstall the extension.");
        }

        // Route endpoint depending on whether contextUrl is provided
        var endpoint = this.baseUrl + "/api/translate";
        if (job.contextUrl) {
            endpoint = this.baseUrl + "/api/v1/translate/with-context";
        }

        // Prepare payload
        var payload = {
            source_lang: job.sourceLang,
            target_lang: job.targetLang,
            items: [],
        };

        if (job.contextUrl) {
            payload.context_url = job.contextUrl;
        }

        for (var i = 0; i < job.items.length; i++) {
            if (job.items[i].isSelected) {
                var layerName = job.items[i].layerName || "";
                var isBtn = layerName.toLowerCase().indexOf('btn') > -1 || layerName.toLowerCase().indexOf('button') > -1;
                payload.items.push({
                    id: job.items[i].id,
                    text: job.items[i].text,
                    layer_name: layerName,
                    is_button: isBtn
                });
            }
        }

        // Create temp files for request/response
        var tempFolder = Folder.temp;
        var timestamp = new Date().getTime();
        var reqFile = new File(tempFolder + "/req_" + timestamp + ".json");
        var resFile = new File(tempFolder + "/res_" + timestamp + ".json");

        // Write JSON payload
        reqFile.open("w");
        reqFile.encoding = "UTF-8";
        reqFile.write(JSON.stringify(payload));
        reqFile.close();

        // Build cURL command WITH API KEY HEADER
        var cmd = 'curl -s -X POST "' + endpoint + '"';
        cmd += ' -H "Content-Type: application/json"';
        cmd += ' -H "X-API-Key: ' + this.apiKey + '"';
        cmd += ' -d "@' + reqFile.fsName + '"';
        cmd += ' -o "' + resFile.fsName + '"';

        // Execute via batch file (Illustrator ExtendScript limitation)
        var batFile = new File(tempFolder + "/req_" + timestamp + ".bat");
        batFile.open("w");
        batFile.write('@echo off\n');
        batFile.write(cmd);
        batFile.close();

        // Chay ngam qua VBS (an cua so CMD)
        var vbsFile = new File(tempFolder + "/req_silent_" + timestamp + ".vbs");
        vbsFile.open("w");
        vbsFile.write('Set WshShell = CreateObject("WScript.Shell")\n');
        vbsFile.write('WshShell.Run chr(34) & "' + batFile.fsName + '" & chr(34), 0, False\n');
        vbsFile.close();
        vbsFile.execute();

        // Wait for response file (max 15 seconds)
        var timeout = 60;
        while (timeout > 0) {
            if (resFile.exists && resFile.length > 0) {
                if (resFile.open("r")) {
                    resFile.close();
                    break;
                }
            }
            $.sleep(100);
            timeout--;
        }

        batFile.remove();
        if (vbsFile && vbsFile.exists) vbsFile.remove();

        // Read response
        var result = null;
        if (resFile.exists) {
            resFile.open("r");
            resFile.encoding = "UTF-8";
            var content = resFile.read();
            resFile.close();

            try {
                result = JSON.parse(content);

                // Check for authentication errors
                if (result.detail && result.detail.code) {
                    if (result.detail.code === "MISSING_API_KEY" ||
                        result.detail.code === "INVALID_API_KEY") {
                        throw new Error("Invalid API Key.\nContact Admin to get a new key and reinstall.");
                    }
                }
            } catch (e) {
                if (e.message.indexOf("API Key") >= 0) {
                    throw e;
                }
                throw new Error("Failed to parse backend response: " + e.message);
            }

            resFile.remove();
        } else {
            throw new Error("No response from backend server. Is it running?");
        }

        reqFile.remove();

        return result;
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

        // 1. Khởi tạo Payload theo Schema mới
        var endpoint = this.baseUrl + "/api/translate";
        var contextUrl = jobs[0].contextUrl;
        if (contextUrl) {
            endpoint = this.baseUrl + "/api/v1/translate/with-context";
        }

        var payload = {
            source_lang: jobs[0].sourceLang || "auto",
            target_langs: [],
            items: []
        };

        if (contextUrl) {
            payload.context_url = contextUrl;
        }

        // Lấy danh sách ngôn ngữ
        for (var j = 0; j < jobs.length; j++) {
            payload.target_langs.push({
                code: jobs[j].langCode,
                name: jobs[j].targetLang
            });
            // Khởi tạo dict rỗng sẵn phòng hờ lỗi
            responseMapByLang[jobs[j].langCode] = {};
        }

        // Lấy list items từ job đầu tiên (vì tất cả job đều chung 1 list textItems)
        var sourceItems = jobs[0].items || [];
        for (var i = 0; i < sourceItems.length; i++) {
            var included = (sourceItems[i].isIncluded !== undefined) ? sourceItems[i].isIncluded : sourceItems[i].isSelected;
            if (included !== false) {
                var layerName = sourceItems[i].layerName || "";
                var isBtn = layerName.toLowerCase().indexOf('btn') > -1 || layerName.toLowerCase().indexOf('button') > -1;
                payload.items.push({
                    id: sourceItems[i].id,
                    text: sourceItems[i].text,
                    layer_name: layerName,
                    is_button: isBtn
                });
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
                        if (parsedObj.detail.code === "MISSING_API_KEY" || parsedObj.detail.code === "INVALID_API_KEY") {
                            throw new Error("Invalid API Key in Batch Mode.\nContact Admin to get a new key.");
                        }
                    }
                    if (parsedObj.translations) {
                        for (var lCode in parsedObj.translations) {
                            if (parsedObj.translations.hasOwnProperty(lCode)) {
                                var tArray = parsedObj.translations[lCode];
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
                if (pe.message.indexOf("API Key") >= 0) {
                    throw pe;
                }
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

        return responseMapByLang;
    }
};

// Note: PythonBackendAdapter.init() is called explicitly by host_app.jsx (DI pattern)
