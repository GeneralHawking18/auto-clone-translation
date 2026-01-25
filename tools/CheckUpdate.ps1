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

if (-not $repo) {
    [System.Windows.Forms.MessageBox]::Show("GitHub repo not configured in config.json", "Error", "OK", "Error")
    exit 1
}

try {
    # Call GitHub API
    $release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest" `
        -Headers @{ "User-Agent" = "UpdateChecker" }
    
    $latestVersion = $release.tag_name -replace '^v', ''
    $downloadUrl = if ($release.assets.Count -gt 0) { $release.assets[0].browser_download_url } else { $null }
    
    # Compare versions
    if ([version]$latestVersion -gt [version]$currentVersion) {
        $result = [System.Windows.Forms.MessageBox]::Show(
            "New version $latestVersion available!`nCurrent: $currentVersion`n`nDownload now?",
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
