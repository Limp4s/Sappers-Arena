Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
MsgBox "Подождите пару секунд и перезагрузите сайт", vbInformation, "Sappers Arena"
WshShell.Run "cmd.exe /c """ & WshShell.CurrentDirectory & "\run-web.bat""", 0, False
