Option Explicit
Dim shell, fs, root, script, link, destination
Set shell = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")
root = fs.GetParentFolderName(WScript.ScriptFullName)
For Each destination In Array(fs.BuildPath(root, "EzDeck.lnk"), fs.BuildPath(shell.SpecialFolders("Desktop"), "EzDeck.lnk"))
  If Not fs.FileExists(destination) Then
    Set link = shell.CreateShortcut(destination)
    link.TargetPath = fs.BuildPath(shell.ExpandEnvironmentStrings("%SystemRoot%"), "System32\wscript.exe")
    link.Arguments = Chr(34) & WScript.ScriptFullName & Chr(34)
    link.WorkingDirectory = root
    link.IconLocation = fs.BuildPath(root, "ezdeck.ico") & ",0"
    link.Description = "Abrir EzDeck"
    link.Save
  End If
Next
script = fs.BuildPath(root, "windows\desktop.ps1")
shell.Run "powershell.exe -NoLogo -NoProfile -STA -ExecutionPolicy Bypass -File " & Chr(34) & script & Chr(34), 0, False
