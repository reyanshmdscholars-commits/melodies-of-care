@echo off
cd /d "%~dp0"

echo.
echo   Melodies of Care
echo   Starting development server...
echo.

where node >nul 2>&1
if errorlevel 1 goto NO_NODE

echo   Node.js found:
node --version
echo.

if not exist "node_modules\.bin\next.cmd" goto INSTALL
goto START

:INSTALL
echo   Installing dependencies - please wait (~60 seconds)...
call npm install
if errorlevel 1 goto NPM_ERROR
echo.

:START
echo   Server starting at http://localhost:3000
echo   Press Ctrl+C to stop, then close this window.
echo.
call npm run dev
goto END

:NO_NODE
echo   ERROR: Node.js not found.
echo   Download it from https://nodejs.org then try again.
goto END

:NPM_ERROR
echo   ERROR: npm install failed. See messages above.
goto END

:END
echo.
pause
