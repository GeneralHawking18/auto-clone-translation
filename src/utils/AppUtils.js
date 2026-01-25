/**
 * @class AppUtils
 * @description Common utility functions for the application.
 */
var AppUtils = {
    /**
     * Trim whitespace from start and end of string
     * @param {string} str 
     * @returns {string}
     */
    trim: function (str) {
        if (!str) return "";
        return str.replace(/^\s+|\s+$/g, '');
    },

    /**
     * Safely execute a function
     * @param {Function} fn 
     * @param {*} defaultValue 
     * @returns {*}
     */
    safeExecute: function (fn, defaultValue) {
        try {
            return fn();
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Safely get item from array
     * @param {Array} arr 
     * @param {number} index 
     * @param {*} defaultValue 
     * @returns {*}
     */
    safeGet: function (arr, index, defaultValue) {
        return (arr && arr[index] !== undefined) ? arr[index] : (defaultValue || "");
    },

    /**
     * Log error to console/alert
     * @param {string} msg 
     */
    logError: function (msg) {
        if (typeof $.writeln === 'function') {
            $.writeln("ERROR: " + msg);
        } else {
            alert("ERROR: " + msg);
        }
    },

    /**
     * Write content to a file on Desktop
     * @param {string} content 
     * @param {string} fileName 
     * @returns {string} File path
     */
    writeLog: function (content, fileName) {
        var path = Folder.desktop + "/" + fileName;
        var file = new File(path);
        file.encoding = "UTF-8";
        if (file.open("w")) {
            file.write(content);
            file.close();
        }
        return path;
    }
};
