try {
    app.unloadAction("Auto Clone Translation", "");
} catch (e) {
    // Action might not be loaded
}

try {
    app.unloadAction("Auto Clone From Sheet", "");
} catch (e) {
    // Legacy name
}
