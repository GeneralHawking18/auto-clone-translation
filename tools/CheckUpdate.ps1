# CheckUpdate.ps1 - GitHub Release Updater
# Usage: powershell -ExecutionPolicy Bypass -File CheckUpdate.ps1

Add-Type -AssemblyName System.Windows.Forms

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "config.json"

# Load config
if (-not (Test-Path $configPath)) {
    [System.Windows.Forms.MessageBox]::Show("config.json not found!", "Error", "OK", "Error")
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json
$currentVersion = $config.version
$repo = $config.githubRepo
$checkPrerelease = if ($config.checkPrerelease) { $config.checkPrerelease } else { $false }

if (-not $repo) {
    [System.Windows.Forms.MessageBox]::Show("GitHub repo not configured in config.json", "Error", "OK", "Error")
    exit 1
}

try {
    # Call GitHub API - use different endpoint based on prerelease setting
    if ($checkPrerelease) {
        # Get all releases and pick the first one (includes pre-releases)
        $releases = Invoke-RestMethod "https://api.github.com/repos/$repo/releases" `
            -Headers @{ "User-Agent" = "UpdateChecker" }
        $release = $releases | Select-Object -First 1
    } else {
        # Get only the latest stable release
        $release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest" `
            -Headers @{ "User-Agent" = "UpdateChecker" }
    }
    
    $latestVersion = $release.tag_name -replace '^v', ''
    $downloadUrl = if ($release.assets.Count -gt 0) { $release.assets[0].browser_download_url } else { $null }
    $isPrerelease = $release.prerelease

    # Compare versions
    if ([version]$latestVersion -gt [version]$currentVersion) {
        $prereleaseNote = if ($isPrerelease) { " (Pre-release)" } else { "" }
        $result = [System.Windows.Forms.MessageBox]::Show(
            "New version $latestVersion$prereleaseNote available!`nCurrent: $currentVersion`n`nDownload now?",
            "Update Available", "YesNo", "Information")
        
        if ($result -eq "Yes" -and $downloadUrl) {
            # Download to temp and run
            $tempPath = Join-Path $env:TEMP "AutoCloneTranslationSetup_$latestVersion.exe"
            Write-Host "Downloading update..."
            Invoke-WebRequest $downloadUrl -OutFile $tempPath -UseBasicParsing
            Start-Process $tempPath
        }
    } else {
        [System.Windows.Forms.MessageBox]::Show(
            "You have the latest version ($currentVersion)", 
            "Up to Date", "OK", "Information")
    }
} catch {
    [System.Windows.Forms.MessageBox]::Show(
        "Failed to check for updates:`n$($_.Exception.Message)", 
        "Error", "OK", "Error")
}
