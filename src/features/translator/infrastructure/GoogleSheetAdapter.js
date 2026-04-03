/**
 * @class GoogleSheetAdapter
 * @layer Infrastructure
 *
 * Schema Google Sheet thuc te:
 *   Row 0 (header): Ngon ngu | Ten anh | element_1 | element_2 | ...
 *   Row 1+:         VI       | abc.png | Luyen tap | Mo khoa   | ...
 *
 * fetchContext tra ve:
 *   {
 *     configs: [{ langCode, namePicture }],
 *     elementIds: ["element_1", "element_2", ...],
 *     responseMap: { "vi": { "element_1": "Luyen tap" }, "es": { ... } }
 *   }
 */
var GoogleSheetAdapter = {

    init: function () { return this; },

    // ------------------------------------------------------------------ //
    // Chuyen URL share → URL export CSV                                   //
    // ------------------------------------------------------------------ //
    _convertToExportUrl: function (url) {
        var match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) return null;
        var docId = match[1];

        var gid = "0";
        var gidMatch = url.match(/[#&]gid=([0-9]+)/);
        // Lay gid cuoi cung trong URL (truong hop co nhieu gid=...)
        var allGids = url.match(/gid=([0-9]+)/g);
        if (allGids && allGids.length > 0) {
            gid = allGids[allGids.length - 1].replace("gid=", "");
        }

        return "https://docs.google.com/spreadsheets/d/" + docId +
               "/export?format=csv&gid=" + gid;
    },

    // ------------------------------------------------------------------ //
    // Main: Tai + Parse CSV                                               //
    // ------------------------------------------------------------------ //
    /**
     * @param {string} sheetUrl
     * @returns {{
     *   configs: Array<{langCode:string, namePicture:string}>,
     *   elementIds: string[],
     *   responseMap: Object
     * }}
     */
    fetchContext: function (sheetUrl) {
        var exportUrl = this._convertToExportUrl(sheetUrl);
        if (!exportUrl) {
            throw new Error("Invalid Google Sheets URL.\nExpected: https://docs.google.com/spreadsheets/d/...");
        }

        var tempFolder = Folder.temp;
        var timestamp  = new Date().getTime();
        var csvFile    = new File(tempFolder + "/sheet_" + timestamp + ".csv");
        var batFile    = new File(tempFolder + "/fetch_" + timestamp + ".bat");
        var vbsFile    = new File(tempFolder + "/run_silent_" + timestamp + ".vbs");

        // Ghi bat file
        var cmd = '@echo off\r\ncurl -sL "' + exportUrl + '" -o "' + csvFile.fsName + '"\r\n';
        batFile.open("w");
        batFile.write(cmd);
        batFile.close();

        // Chay ngam qua VBS (an cua so CMD)
        vbsFile.open("w");
        vbsFile.write('Set WshShell = CreateObject("WScript.Shell")\n');
        vbsFile.write('WshShell.Run chr(34) & "' + batFile.fsName + '" & chr(34), 0, False\n');
        vbsFile.close();
        vbsFile.execute();

        // Cho file CSV xuat hien (toi da 15 giay)
        var timeout = 150;
        while (timeout > 0) {
            if (csvFile.exists && csvFile.length > 0) {
                if (csvFile.open("r")) { csvFile.close(); break; }
            }
            $.sleep(100);
            timeout--;
        }

        // Don dep
        if (batFile.exists) batFile.remove();
        if (vbsFile.exists) vbsFile.remove();

        if (!csvFile.exists || csvFile.length === 0) {
            throw new Error("Timeout or network error.\nCheck your internet connection and try again.");
        }

        // Doc CSV
        csvFile.open("r");
        csvFile.encoding = "UTF-8";
        var content = csvFile.read();
        csvFile.close();
        csvFile.remove();

        // Kiem tra HTML redirect (Sheet private)
        if (content.indexOf("<html") >= 0 || content.indexOf("<HTML") >= 0) {
            throw new Error("Sheet is private!\nShare -> 'Anyone with the link' -> Viewer, then retry.");
        }

        return this._parseSheetData(content);
    },

    // ------------------------------------------------------------------ //
    // Parse toan bo CSV content thanh mang 2 chieu (xu ly duoc multiline) 
    // ------------------------------------------------------------------ //
    _parseCSVContent: function (content) {
        var rows = [];
        var currentRow = [];
        var currentCell = "";
        var inQuotes = false;
        
        for (var i = 0; i < content.length; i++) {
            var ch = content[i];
            
            if (ch === '"') {
                if (inQuotes && i + 1 < content.length && content[i + 1] === '"') {
                    // Escaped quote (hai dau ngoac kep)
                    currentCell += '"';
                    i++;
                } else {
                    // Bat / Tat quotes
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                // Het 1 cell
                currentRow.push(currentCell.replace(/^\s+|\s+$/g, ""));
                currentCell = "";
            } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
                // Het dong
                if (ch === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
                    i++; // Bo qua \n cua \r\n
                }
                currentRow.push(currentCell.replace(/^\s+|\s+$/g, ""));
                rows.push(currentRow);
                currentRow = [];
                currentCell = "";
            } else {
                currentCell += ch;
            }
        }
        
        // Push cell cuoi cung
        if (currentCell !== "" || currentRow.length > 0) {
            currentRow.push(currentCell.replace(/^\s+|\s+$/g, ""));
            rows.push(currentRow);
        }
        
        return rows;
    },

    // ------------------------------------------------------------------ //
    // Parse noi dung CSV theo schema: Row 0 = header, Row 1+ = mot ngon ngu
    // ------------------------------------------------------------------ //
    _parseSheetData: function (content) {
        var self    = this;
        var rawRows = self._parseCSVContent(content);

        if (rawRows.length === 0) return { configs: [], elementIds: [], responseMap: {} };

        // Lay dong header
        var headerParts = rawRows[0];

        // Col 0: Ngon ngu / Language
        // Col 1: Ten anh / Name Picture
        // (Khong can lay elementIds hay responseMap nua vi backend se xu ly dict)
        
        var HEADER_KEYWORDS = {
            "ngon ngu": true, "language": true, "lang": true,
            "ngon-ngu": true, "ngôn ngữ": true
        };

        var configs     = [];
        var responseMap = {};

        for (var i = 1; i < rawRows.length; i++) {
            var parts = rawRows[i];
            
            // Kiem tra array rong
            var isEmpty = true;
            for(var p=0; p<parts.length; p++) {
                if(parts[p]) { isEmpty = false; break; }
            }
            if(isEmpty) continue;

            var rawLang = parts[0];
            if (!rawLang) continue;

            // Chuan hoa lowercase, trim
            var langCode = rawLang.replace(/^\s+|\s+$/g, "").toLowerCase();
            if (!langCode) continue;

            // Bo qua dong header lap lai
            if (HEADER_KEYWORDS[langCode]) continue;

            var namePicture = parts.length > 1 ? parts[1].replace(/^\s+|\s+$/g, "") : "";

            configs.push({ langCode: langCode, namePicture: namePicture });
        }

        return {
            configs:     configs,
            elementIds:  [],
            responseMap: {}
        };
    }
};
