# LoadAction.ps1 - Load Action into Adobe Illustrator
# Uses COM to connect to Illustrator and run JSX script

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$unloadJsxPath = Join-Path $scriptDir "UnloadAction.jsx"
$loadJsxPath = Join-Path $scriptDir "LoadAction.jsx"
$actionPath = Join-Path $scriptDir "Auto_Clone_Translation.aia"

# Check files exist
if (-not (Test-Path $actionPath)) {
    # Try alternate location
    $actionPath = Join-Path (Split-Path -Parent $scriptDir) "assets\actions\Auto_Clone_Translation.aia"
}

if (-not (Test-Path $actionPath)) {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("Action file not found!", "Error", "OK", "Error")
    exit 1
}

# Wait for Illustrator to be fully ready
Start-Sleep -Seconds 2

try {
    # Connect to running Illustrator via COM
    $ai = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Illustrator.Application")
    
    # Step 1: Unload existing actions (loop to remove all duplicates)
    $namesToUnload = @("Auto Clone Translation", "Auto Clone From Sheet")
    foreach ($name in $namesToUnload) {
        $attempts = 0
        while ($attempts -lt 20) {
            try {
                $ai.UnloadAction($name, "")
                $attempts++
            } catch {
                break
            }
        }
    }
    
    # Step 2: Load action from file
    $ai.LoadAction($actionPath)
    
    Write-Host "Action loaded successfully: $actionPath"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    # Fallback: try opening JSX file directly
    if (Test-Path $loadJsxPath) {
        Start-Process $loadJsxPath
    }
}
