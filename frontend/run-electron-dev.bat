@echo off
setlocal

cd /d "%~dp0"

REM Prevent CRA dev server from opening a browser window (Electron will open its own window)
set BROWSER=none

REM Starts React dev server and Electron pointing at it
"D:\Program\Node.js\npm.cmd" run desktop:dev

endlocal
