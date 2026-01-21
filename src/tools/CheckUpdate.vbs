' CheckUpdate.vbs - Simple Updater
Option Explicit

Dim fso, shell, http
Dim currentVer, updateUrl, newVer, downloadUrl
Dim iniFile, jsonFile, iniPath, tempJsonPath
Dim strLine, arrParts

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' 1. Read Config.ini
iniPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\config.ini"

If Not fso.FileExists(iniPath) Then
    ' Check fallback for Dev structure (../config/config.ini)
    iniPath = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName)) & "\config\config.ini"
    If Not fso.FileExists(iniPath) Then
        MsgBox "Error: config.ini not found!", 16, "Update Check"
        WScript.Quit
    End If
End If

Set iniFile = fso.OpenTextFile(iniPath, 1)
Do Until iniFile.AtEndOfStream
    strLine = iniFile.ReadLine
    If InStr(strLine, "Version=") > 0 Then
        currentVer = Split(strLine, "=")(1)
    ElseIf InStr(strLine, "UpdateURL=") > 0 Then
        updateUrl = Split(strLine, "=")(1)
    End If
Loop
iniFile.Close

If updateUrl = "" Then
    MsgBox "Update URL is not configured yet.", 64, "Check for Updates"
    WScript.Quit
End If

' 2. Download remote version info
On Error Resume Next
Set http = CreateObject("MSXML2.XMLHTTP")
http.Open "GET", updateUrl, False
http.Send

If Err.Number <> 0 Then
    MsgBox "Could not connect to update server.", 16, "Connection Error"
    WScript.Quit
End If
On Error Goto 0

' 3. Parse JSON (Simple parsing)
Dim response
response = http.responseText

' Simple Regex-like extraction
newVer = ExtractJsonValue(response, "version")
downloadUrl = ExtractJsonValue(response, "downloadUrl")

If newVer = "" Then
    MsgBox "Invalid server response.", 16, "Error"
    WScript.Quit
End If

' 4. Compare
If newVer <> currentVer Then
    Dim res
    res = MsgBox("New version " & newVer & " is available!" & vbCrLf & _
                 "Current version: " & currentVer & vbCrLf & vbCrLf & _
                 "Do you want to download it now?", 36, "Update Available")
    If res = 6 Then ' Yes
        If downloadUrl <> "" Then
            shell.Run downloadUrl
        Else
            MsgBox "Download URL not found in update info.", 48, "Error"
        End If
    End If
Else
    MsgBox "You are using the latest version (" & currentVer & ").", 64, "Up to Date"
End If


' Helper function
Function ExtractJsonValue(json, key)
    Dim startPos, endPos, searchStr
    searchStr = """" & key & """"
    startPos = InStr(json, searchStr)
    If startPos > 0 Then
        startPos = InStr(startPos, ":") + 1
        ' Skip whitespace and quote
        Do While Mid(json, startPos, 1) = " " Or Mid(json, startPos, 1) = """"
            startPos = startPos + 1
        Loop
        endPos = InStr(startPos, json, """")
        If endPos = 0 Then endPos = InStr(startPos, json, ",") ' Fallback if number
        If endPos = 0 Then endPos = InStr(startPos, json, "}")
        
        ExtractJsonValue = Mid(json, startPos, endPos - startPos)
    Else
        ExtractJsonValue = ""
    End If
End Function
