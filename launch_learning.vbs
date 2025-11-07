Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
batPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\launch_learning.bat"
WshShell.Run chr(34) & batPath & chr(34), 0
Set WshShell = Nothing
