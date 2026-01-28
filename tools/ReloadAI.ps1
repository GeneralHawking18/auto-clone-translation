# ReloadAI.ps1 - Restart Adobe Illustrator
# Usage: powershell -ExecutionPolicy Bypass -File ReloadAI.ps1

Write-Host "Stopping Illustrator..."
Stop-Process -Name "Illustrator" -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 1

Write-Host "Starting Illustrator..."
try {
    $ai = New-Object -ComObject Illustrator.Application
    Write-Host "Illustrator Reloaded."
}
catch {
    # Try alternative method
    Start-Process "illustrator" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    try {
        $ai = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Illustrator.Application")
        Write-Host "Illustrator Reloaded (via GetActiveObject)."
    }
    catch {
        Write-Host "Warning: Could not verify Illustrator started. Please check manually."
    }
}
