# LoadAction.ps1 - Load Action into Adobe Illustrator
# Robust Version: Starts Illustrator if needed, logs output, handles errors.

param([switch]$KeepOpen)

$ErrorActionPreference = "Stop"

# Setup Logging
try {
    $tempPath = [System.IO.Path]::GetTempPath()
    $logFile = Join-Path $tempPath "AutoCloneTranslation_Install.log"
}
catch {
    $logFile = $null # Logging disabled if path fails
}

function Log-Message {
    param([string]$Message)
    $ts = Get-Date -Format 'HH:mm:ss'
    Write-Host "$ts - $Message"
    if ($logFile) {
        try { Add-Content -Path $logFile -Value "$ts - $Message" -Force } catch {}
    }
}

Log-Message "Starting LoadAction.ps1... KeepOpen=$KeepOpen"

try {
    # 1. Determine Paths
    # 1. Determine Paths
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Log-Message "Script Directory: '$scriptDir'"
    
    $actionNameStr = "Auto_Clone_Translation.aia"
    $possiblePaths = @()
    
    if ($scriptDir) {
        $possiblePaths += Join-Path $scriptDir $actionNameStr
        $parentDir = Split-Path -Parent $scriptDir
        if ($parentDir) {
            $possiblePaths += Join-Path $parentDir "assets\actions\$actionNameStr"
        }
    }
    
    # Fallback to hardcoded
    $possiblePaths += "C:\Program Files\Auto Clone Translation\$actionNameStr"
    $possiblePaths += "C:\Program Files (x86)\Auto Clone Translation\$actionNameStr"

    $actionPath = $null
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $actionPath = $path
            break
        }
    }

    if (-not $actionPath) {
        throw "Action file (.aia) not found in any expected location."
    }
    Log-Message "Found Action file at: $actionPath"


    # 2. Connect to or Start Illustrator
    $ai = $null
    $startedByScript = $false

    try {
        $ai = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Illustrator.Application")
        Log-Message "Connected to running instance of Illustrator."
    }
    catch {
        Log-Message "Illustrator not running. Launching new background instance..."
        $ai = New-Object -ComObject Illustrator.Application
        $startedByScript = $true
        
        # Wait for initialize
        Start-Sleep -Seconds 5
        
        # Attempt "invisible" mode
        try { $ai.UserInteractionLevel = -1 } catch {}
    }

    if (-not $ai) { throw "Failed to create Illustrator Application object." }

    # 3. Load the Action
    $actionName = "Auto Clone Translation"
    
    Log-Message "Cleaning up old actions..."
    try { $ai.UnloadAction($actionName, "") } catch {
        Log-Message "Unload info: $($_.Exception.Message)"
    }
    
    Log-Message "Loading action from '$actionPath'..."
    $ai.LoadAction($actionPath)
    Log-Message "SUCCESS: Action loaded."
    
    # 4. Cleanup
    if ($startedByScript -and -not $KeepOpen) {
        Log-Message "Saving preferences and quitting background instance..."
        $ai.Quit()
    }
    else {
        Log-Message "Leaving Illustrator open."
        if ($startedByScript) {
            try { $ai.UserInteractionLevel = 1 } catch {}
            try { $ai.Visible = $true } catch {}
            try { $ai.Activate() } catch {}
        }
    }

}
catch {
    Log-Message "CRITICAL ERROR: $($_.Exception.Message)"
    Log-Message "Stack Trace: $($_.ScriptStackTrace)"
    
    # Emergency Cleanup
    if ($startedByScript -and $ai) {
        try { $ai.Quit() } catch {}
    }
    
    # Setup might hide console, so we try a MsgBox if interactive, but logs are key.
    exit 1
}

Log-Message "Done."
exit 0
