' LoadAction.vbs - Load Action vào Illustrator (Robust Method) - Reverted by User Request
Option Explicit

Dim app, fso, scriptPath, actionPath
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
actionPath = scriptPath & "\Auto_Clone_From_Sheet.aia"

' Check if file exists in current folder (Installed mode)
If Not fso.FileExists(actionPath) Then
    ' Check if file exists in ../actions/ folder (Source mode)
    actionPath = fso.GetParentFolderName(scriptPath) & "\actions\Auto_Clone_From_Sheet.aia"
    If Not fso.FileExists(actionPath) Then
         MsgBox "Không tìm thấy file action:" & vbCrLf & actionPath, 16, "Lỗi"
         WScript.Quit
    End If
End If

' Kết nối Illustrator - Robust Method with Retry
On Error Resume Next
Set app = CreateObject("Illustrator.Application")

If Err.Number <> 0 Then
    ' Nếu không thể khởi tạo tự động, thử kích hoạt qua Shell
    Err.Clear
    Dim shell
    Set shell = CreateObject("WScript.Shell")
    ' Launch Illustrator (Windows will find it in Path or Registry)
    shell.Run "illustrator", 1, False
    
    ' Wait retry loop (up to 30 seconds)
    Dim i
    For i = 1 To 15
        WScript.Sleep 2000 ' Wait 2 sec
        Err.Clear
        Set app = GetObject(, "Illustrator.Application")
        If Err.Number = 0 Then Exit For
    Next
End If

If Err.Number <> 0 Then
    MsgBox "Failed to launch or connect to Adobe Illustrator." & vbCrLf & _
           "Please open Illustrator manually once to ensure it works.", 16, "Error"
    WScript.Quit
End If
On Error Goto 0

' 2. Unload existing Action Set (if any) using generated JSX
' Strategy: Generate a temp JSX file to safely unload the action set.
' This avoids path issues and ensures the helper always exists.

Dim fsoTemp, tempJsxPath, tempLogPath
Set fsoTemp = CreateObject("Scripting.FileSystemObject")
tempJsxPath = fsoTemp.GetSpecialFolder(2) & "\unload_action_" & fsoTemp.GetTempName() & ".jsx"
tempLogPath = fsoTemp.GetSpecialFolder(2) & "\action_unload_log_" & fsoTemp.GetTempName() & ".txt"

' Create the JSX script to unload
Dim jsxFile
Set jsxFile = fsoTemp.CreateTextFile(tempJsxPath, True)
jsxFile.WriteLine "var setName = 'Auto Clone From Sheet';"
jsxFile.WriteLine "var logFile = new File('" & Replace(tempLogPath, "\", "/") & "');"
jsxFile.WriteLine "logFile.open('w');"
jsxFile.WriteLine "try {"
jsxFile.WriteLine "    app.unloadAction(setName, '');"
jsxFile.WriteLine "    logFile.writeln('Success: Unloaded');"
jsxFile.WriteLine "} catch(e) {"
jsxFile.WriteLine "    logFile.writeln('Error: ' + e.message);"
jsxFile.WriteLine "}"
jsxFile.WriteLine "logFile.close();"
jsxFile.Close

' Execute the JSX
On Error Resume Next
app.DoJavaScriptFile tempJsxPath
If Err.Number <> 0 Then
    ' Simple fallback if JSX execution fails entirely
    Err.Clear
    app.UnloadAction "Auto Clone From Sheet", ""
    Err.Clear
End If
On Error Goto 0

' Clean up JSX file
If fsoTemp.FileExists(tempJsxPath) Then fsoTemp.DeleteFile tempJsxPath

' Optional: Check log if debugging needed (commented out for production)
' If fsoTemp.FileExists(tempLogPath) Then
'    Dim logF, content
'    Set logF = fsoTemp.OpenTextFile(tempLogPath, 1)
'    content = logF.ReadAll
'    logF.Clos
'    fsoTemp.DeleteFile tempLogPath
' End If

' Now Load the new Action
On Error Resume Next
app.LoadAction(actionPath)

If Err.Number <> 0 Then
    MsgBox "Lỗi khi load Action: " & actionPath & vbCrLf & "Chi tiết: " & Err.Description, 16, "Lỗi"
End If
On Error Goto 0

