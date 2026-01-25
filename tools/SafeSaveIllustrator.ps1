# SafeSaveIllustrator.ps1 - Save all open Illustrator documents before setup
# Usage: powershell -ExecutionPolicy Bypass -File SafeSaveIllustrator.ps1

# Connect to running Illustrator
try {
    $ai = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Illustrator.Application")
} catch {
    Write-Host "Illustrator is not running. Nothing to save."
    exit 0
}

# Define backup folder
$backupFolder = Join-Path $env:TEMP "AutoCloneTranslationBackup"
if (-not (Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
}

$docCount = $ai.Documents.Count
if ($docCount -eq 0) {
    Write-Host "No open documents found in Illustrator."
    exit 0
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$savedCount = 0
$newSavedCount = 0

# Loop through all documents
for ($i = 1; $i -le $docCount; $i++) {
    $doc = $ai.Documents.Item($i)
    
    try {
        # Check if document has been saved before
        $fullName = $doc.FullName
        
        if ($fullName -and (Test-Path $fullName)) {
            # Existing file - just save
            $doc.Save()
            Write-Host "Saved: $($doc.Name)"
            $savedCount++
        } else {
            # New/untitled document - SaveAs to backup folder
            $safeName = $doc.Name -replace '[:\\/*?"<>|]', '_'
            $savePath = Join-Path $backupFolder "$($safeName)_$timestamp.ai"
            
            $doc.SaveAs($savePath)
            Write-Host "Saved new file to: $savePath"
            $newSavedCount++
        }
    } catch {
        Write-Host "Error saving $($doc.Name): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Existing files saved: $savedCount"
Write-Host "New files saved to backup: $newSavedCount"
Write-Host "Total: $($savedCount + $newSavedCount) / $docCount"
