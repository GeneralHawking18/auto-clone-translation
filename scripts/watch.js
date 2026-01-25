const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

// Configuration
const WATCH_DIR = path.join(__dirname, '../src');
const BUILD_SCRIPT = path.join(__dirname, 'build.js');
const RELOAD_TOOL = path.join(__dirname, '../tools/ReloadAI.vbs');
const SETUP_ISS = path.join(__dirname, '../setup.iss');
const SETUP_EXE = path.join(__dirname, '../AutoCloneTranslationSetup.exe');
const ISCC_PATH = '"C:\Program Files (x86)\Inno Setup 6\ISCC.exe"';

let isProcessing = false;

console.log('--- Illustrator Dev Workflow ---');
console.log('1. Build JSX');
console.log('2. Build Installer');
console.log('3. Run Installer (Silent)');
console.log('4. Reload Illustrator');
console.log(`Watching: ${WATCH_DIR}`);
console.log('Press Ctrl+C to stop.');

// Initial run
runFullCycle();

// Watch for changes
fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && !isProcessing) {
        console.log(`\nChange detected: ${filename}`);
        runFullCycle();
    }
});

function runFullCycle() {
    if (isProcessing) return;
    isProcessing = true;

    // Chain the commands using Promises for better control
    Promise.resolve()
        .then(() => executeStep('Building JSX...', `node "${BUILD_SCRIPT}"`))
        .then(() => executeStep('Building Installer...', `${ISCC_PATH} "${SETUP_ISS}"`))
        .then(() => executeStep('Running Installer...', `"${SETUP_EXE}" /VERYSILENT /SUPPRESSMSGBOXES`))
        .then(() => {
            console.log('Reloading Illustrator...');
            const vbsProc = spawn('cscript', ['//Nologo', RELOAD_TOOL], { stdio: 'inherit' });
            return new Promise((resolve) => {
                vbsProc.on('close', resolve);
            });
        })
        .then(() => {
            console.log('=== Cycle Complete ===');
            isProcessing = false;
        })
        .catch((err) => {
            console.error('!!! Workflow Failed !!!');
            console.error(err);
            isProcessing = false;
        });
}

function executeStep(label, command) {
    return new Promise((resolve, reject) => {
        console.log(label);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(stdout); // Often error details are in stdout for CLI tools
                console.error(stderr);
                reject(error);
                return;
            }
            // Optional: print stdout if needed, currently kept clean
            resolve(stdout);
        });
    });
}