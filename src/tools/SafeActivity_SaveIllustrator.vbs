' SafeActivity_SaveIllustrator.vbs
' Saves ALL open Illustrator documents before running setup.
' New/untitled files are saved to a temp folder with timestamp.
Option Explicit

Dim app, doc, fso
Dim tempFolder, docName, savePath, timestamp
Dim i, savedCount, newSavedCount

Set fso = CreateObject("Scripting.FileSystemObject")

On Error Resume Next

' Try to connect to running Illustrator
Set app = GetObject(, "Illustrator.Application")

If Err.Number <> 0 Then
    WScript.Echo "Illustrator is not running. Nothing to save."
    WScript.Quit 0
End If

On Error Goto 0

' Define temp folder (in Program Files install location)
tempFolder = "C:\Program Files\AutoFill For Illustrator\tmp"

' Create temp folder if it doesn't exist
If Not fso.FolderExists(tempFolder) Then
    On Error Resume Next
    fso.CreateFolder(tempFolder)
    If Err.Number <> 0 Then
        ' Fallback to user's temp folder if Program Files fails (permissions)
        tempFolder = fso.GetSpecialFolder(2).Path & "\AutoFillIllustratorBackup"
        If Not fso.FolderExists(tempFolder) Then
            fso.CreateFolder(tempFolder)
        End If
    End If
    On Error Goto 0
End If

' Check if there are any open documents
If app.Documents.Count = 0 Then
    WScript.Echo "No open documents found in Illustrator."
    WScript.Quit 0
End If

' Generate timestamp for unique filenames
timestamp = Year(Now) & Right("0" & Month(Now), 2) & Right("0" & Day(Now), 2) & "_" & _
            Right("0" & Hour(Now), 2) & Right("0" & Minute(Now), 2) & Right("0" & Second(Now), 2)

savedCount = 0
newSavedCount = 0

' Loop through ALL open documents
For i = 1 To app.Documents.Count
    Set doc = app.Documents.Item(i)
    
    On Error Resume Next
    
    ' Check if document has been saved before (has a file path)
    If doc.FullName <> "" And fso.FileExists(doc.FullName) Then
        ' Document has existing path - just save it
        doc.Save
        If Err.Number = 0 Then
            WScript.Echo "Saved: " & doc.Name
            savedCount = savedCount + 1
        Else
            WScript.Echo "Error saving " & doc.Name & ": " & Err.Description
            Err.Clear
        End If
    Else
        ' New/untitled document - SaveAs to temp folder with timestamp
        docName = doc.Name
        ' Remove invalid characters from filename
        docName = Replace(docName, ":", "_")
        docName = Replace(docName, "/", "_")
        docName = Replace(docName, "\", "_")
        docName = Replace(docName, "*", "_")
        docName = Replace(docName, "?", "_")
        docName = Replace(docName, """", "_")
        docName = Replace(docName, "<", "_")
        docName = Replace(docName, ">", "_")
        docName = Replace(docName, "|", "_")
        
        ' Add timestamp to prevent duplicates
        savePath = tempFolder & "\" & docName & "_" & timestamp & ".ai"
        
        ' SaveAs with native Illustrator format
        doc.SaveAs savePath
        
        If Err.Number = 0 Then
            WScript.Echo "Saved new file to: " & savePath
            newSavedCount = newSavedCount + 1
        Else
            WScript.Echo "Error saving new file " & doc.Name & ": " & Err.Description
            Err.Clear
        End If
    End If
    
    On Error Goto 0
Next

WScript.Echo ""
WScript.Echo "=== Summary ==="
WScript.Echo "Existing files saved: " & savedCount
WScript.Echo "New files saved to tmp: " & newSavedCount
WScript.Echo "Total: " & (savedCount + newSavedCount) & " / " & app.Documents.Count
