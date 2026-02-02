# ConfigEditor.ps1 - Dialog sua API Key va Backend URL
# UI thiet ke dep, de nhin

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Config stored in AppData (no admin required)
$configDir = "$env:APPDATA\Auto Clone Translation"
$configPath = "$configDir\api_config.json"

# Create directory if not exists
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Doc config hien tai
$config = @{ apiKey = ""; backendUrl = "http://192.168.11.108:8510" }
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
    } catch {}
}

# ============ TAO FORM ============
$form = New-Object System.Windows.Forms.Form
$form.Text = "Auto Clone Translation - Settings"
$form.Size = New-Object System.Drawing.Size(500, 320)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.BackColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Icon banh rang (gear) tu shell32.dll
$iconExtractor = Add-Type -MemberDefinition '
    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr ExtractIcon(IntPtr hInst, string lpszExeFileName, int nIconIndex);
' -Name 'IconExtractor' -Namespace 'Win32' -PassThru
$iconHandle = $iconExtractor::ExtractIcon([IntPtr]::Zero, "shell32.dll", 315)
if ($iconHandle -ne [IntPtr]::Zero) {
    $form.Icon = [System.Drawing.Icon]::FromHandle($iconHandle)
}

# ============ HEADER ============
$pnlHeader = New-Object System.Windows.Forms.Panel
$pnlHeader.Location = New-Object System.Drawing.Point(0, 0)
$pnlHeader.Size = New-Object System.Drawing.Size(500, 60)
$pnlHeader.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 48)
$form.Controls.Add($pnlHeader)

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "Connection Settings"
$lblTitle.Location = New-Object System.Drawing.Point(20, 15)
$lblTitle.Size = New-Object System.Drawing.Size(300, 30)
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 14)
$lblTitle.ForeColor = [System.Drawing.Color]::White
$pnlHeader.Controls.Add($lblTitle)

# ============ CONTENT ============
# GroupBox cho Server Settings
$grpServer = New-Object System.Windows.Forms.GroupBox
$grpServer.Text = "Server Configuration"
$grpServer.Location = New-Object System.Drawing.Point(20, 75)
$grpServer.Size = New-Object System.Drawing.Size(445, 130)
$grpServer.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 9)
$form.Controls.Add($grpServer)

# API Key Label
$lblApiKey = New-Object System.Windows.Forms.Label
$lblApiKey.Text = "API Key"
$lblApiKey.Location = New-Object System.Drawing.Point(15, 30)
$lblApiKey.Size = New-Object System.Drawing.Size(100, 20)
$lblApiKey.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$grpServer.Controls.Add($lblApiKey)

# API Key TextBox
$txtApiKey = New-Object System.Windows.Forms.TextBox
$txtApiKey.Location = New-Object System.Drawing.Point(15, 50)
$txtApiKey.Size = New-Object System.Drawing.Size(415, 25)
$txtApiKey.Font = New-Object System.Drawing.Font("Consolas", 10)
$txtApiKey.Text = $config.apiKey
$grpServer.Controls.Add($txtApiKey)

# Backend URL Label
$lblUrl = New-Object System.Windows.Forms.Label
$lblUrl.Text = "Backend URL"
$lblUrl.Location = New-Object System.Drawing.Point(15, 80)
$lblUrl.Size = New-Object System.Drawing.Size(100, 20)
$lblUrl.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$grpServer.Controls.Add($lblUrl)

# Backend URL TextBox
$txtUrl = New-Object System.Windows.Forms.TextBox
$txtUrl.Location = New-Object System.Drawing.Point(15, 100)
$txtUrl.Size = New-Object System.Drawing.Size(415, 25)
$txtUrl.Font = New-Object System.Drawing.Font("Consolas", 10)
$txtUrl.Text = $config.backendUrl
$grpServer.Controls.Add($txtUrl)

# ============ HINT ============
$lblHint = New-Object System.Windows.Forms.Label
$lblHint.Text = "Contact administrator for API key. Changes apply immediately on next translation."
$lblHint.Location = New-Object System.Drawing.Point(20, 215)
$lblHint.Size = New-Object System.Drawing.Size(445, 20)
$lblHint.ForeColor = [System.Drawing.Color]::Gray
$lblHint.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$form.Controls.Add($lblHint)

# ============ BUTTONS ============
# Button Save
$btnSave = New-Object System.Windows.Forms.Button
$btnSave.Location = New-Object System.Drawing.Point(270, 245)
$btnSave.Size = New-Object System.Drawing.Size(90, 32)
$btnSave.Text = "Save"
$btnSave.BackColor = [System.Drawing.Color]::FromArgb(0, 122, 204)
$btnSave.ForeColor = [System.Drawing.Color]::White
$btnSave.FlatStyle = "Flat"
$btnSave.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 9)
$btnSave.Cursor = "Hand"
$btnSave.Add_Click({
    if ([string]::IsNullOrWhiteSpace($txtApiKey.Text)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Please enter API Key!",
            "Missing Information",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        $txtApiKey.Focus()
        return
    }

    $newConfig = @{
        apiKey = $txtApiKey.Text.Trim()
        backendUrl = $txtUrl.Text.Trim()
    }

    try {
        $newConfig | ConvertTo-Json | Set-Content $configPath -Encoding UTF8
        [System.Windows.Forms.MessageBox]::Show(
            "Saved! Changes will apply on next translation.",
            "Success",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
        $form.Close()
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Cannot save config file. Please run as Administrator.",
            "Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
    }
})
$form.Controls.Add($btnSave)

# Button Cancel
$btnCancel = New-Object System.Windows.Forms.Button
$btnCancel.Location = New-Object System.Drawing.Point(370, 245)
$btnCancel.Size = New-Object System.Drawing.Size(90, 32)
$btnCancel.Text = "Cancel"
$btnCancel.FlatStyle = "Flat"
$btnCancel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$btnCancel.Cursor = "Hand"
$btnCancel.Add_Click({ $form.Close() })
$form.Controls.Add($btnCancel)

# Focus vao API Key khi mo
$form.Add_Shown({ $txtApiKey.Focus() })

# Hien thi form
[void]$form.ShowDialog()
