// UnloadAction.jsx - Helper script to unload action set before loading
// This script is called by LoadAction.vbs

var actionSetName = "Auto Clone From Sheet";

try {
    app.unloadAction(actionSetName, "");
} catch (e) {
    // Action set does not exist, ignore error
}
