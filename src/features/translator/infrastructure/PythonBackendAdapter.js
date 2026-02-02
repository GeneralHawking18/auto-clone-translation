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
    init: function(silent) {
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

        var endpoint = this.baseUrl + "/api/translate";

        // Prepare payload
        var payload = {
            source_lang: job.sourceLang,
            target_lang: job.targetLang,
            items: [],
        };

        for (var i = 0; i < job.items.length; i++) {
            if (job.items[i].isSelected) {
                payload.items.push({
                    id: job.items[i].id,
                    text: job.items[i].text,
                    layer_name: job.items[i].layerName
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

        batFile.execute();

        // Wait for response file (max 30 seconds)
        var timeout = 300;
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
    }
};

// Initialize on load
PythonBackendAdapter.init();
