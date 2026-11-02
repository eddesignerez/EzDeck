Option Explicit
Dim shell, command, argument
Set shell = CreateObject("WScript.Shell")
' PowerShell requires a console context; the GUI script host supplies it while
' remaining independent of Node's DETACHED_PROCESS lifetime.
command = Quote(shell.ExpandEnvironmentStrings("%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"))
For Each argument In WScript.Arguments
  command = command & " " & Quote(argument)
Next
shell.Run command, 0, False

Function Quote(value)
  If InStr(value, Chr(34)) > 0 Or InStr(value, vbCr) > 0 Or InStr(value, vbLf) > 0 Then WScript.Quit 2
  Quote = Chr(34) & value & Chr(34)
End Function
