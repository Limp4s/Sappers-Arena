@echo off
setlocal

cd /d "%~dp0"

REM Ensure CRA doesn't auto-open; we'll open the browser ourselves after server is ready
set BROWSER=none

REM Use npm.cmd to avoid PowerShell npm.ps1 policy issues
start "" "D:\Program\Node.js\npm.cmd" start

REM Wait until the dev server is ready, then open browser
"D:\Program\Node.js\npm.cmd" exec -- wait-on http://localhost:3000
start "" http://localhost:3000

endlocal
