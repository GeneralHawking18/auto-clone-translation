/**
 * @class PythonBackendAdapter
 * @description Handles communication with the Python Backend Service using cURL.
 */
var PythonBackendAdapter = {
    baseUrl: "http://192.168.11.108:8510",

    /**
     * Send translation request to backend
     * @param {TranslationJob} job
     * @returns {Object} Response JSON
     */
    translate: function (job) {
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
        var reqFile = new File(tempFolder + "/req_" + new Date().getTime() + ".json");
        var resFile = new File(tempFolder + "/res_" + new Date().getTime() + ".json");

        // Write JSON payload
        reqFile.open("w");
        reqFile.encoding = "UTF-8";
        reqFile.write(JSON.stringify(payload));
        reqFile.close();

        // Build cURL command
        // -X POST -H "Content-Type: application/json" -d @reqFile -o resFile
        var cmd = 'curl -s -X POST "' + endpoint + '"';
        cmd += ' -H "Content-Type: application/json"';
        cmd += ' -d "@' + reqFile.fsName + '"';
        cmd += ' -o "' + resFile.fsName + '"';

        // Execute
        // Illustrator doesn't have app.system, so we wrap in a bat file
        var batFile = new File(tempFolder + "/req_" + new Date().getTime() + ".bat");
        batFile.open("w");
        batFile.write('@echo off\n');
        batFile.write(cmd);
        batFile.close();

        batFile.execute();

        // Wait for response file (naive wait loop, since execute is async)
        // Max 10 seconds
        var timeout = 100;
        while (timeout > 0 && !resFile.exists) {
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
                // We assume JSON polyfill (json2.js) is included in build
                result = JSON.parse(content);
            } catch (e) {
                throw new Error("Failed to parse backend response: " + e.message);
            }

            // Cleanup
            resFile.remove();
        } else {
            throw new Error("No response from backend server. Is it running?");
        }

        reqFile.remove();

        return result;
    }
};
