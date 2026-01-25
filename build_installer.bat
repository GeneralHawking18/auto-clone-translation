@echo off
setlocal

:: Check for dev argument
if /i "%1"=="dev" goto DevMode

:: If no arg, show menu
echo ==========================================
echo      Illustrator Script Build Tool
echo ==========================================
echo 1. Dev Mode (Build + Installer + Restart AI)
echo 2. Full Build (Build + Installer Only)
echo.
set /p choice="Select option (1-2): "

if "%choice%"=="1" goto DevMode
if "%choice%"=="2" goto FullBuild
echo Invalid choice. Exiting.
pause
exit /b

:DevMode
echo.
echo --- Dev Mode: Rebuilding Setup & Reloading AI ---
call :DoBuild
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo --- Running Installer ---
echo Please complete the installation...
start /wait AutoCloneTranslationSetup.exe

echo.
echo --- Reloading Illustrator ---
powershell -ExecutionPolicy Bypass -File tools\ReloadAI.ps1

echo.
echo --- Loading Action into Illustrator ---
timeout /t 3 /nobreak >nul
powershell -ExecutionPolicy Bypass -File tools\LoadAction.ps1
goto :eof

:FullBuild
echo.
echo --- Full Build: Setup Only ---
call :DoBuild
if %errorlevel% neq 0 exit /b %errorlevel%
echo.
echo Done.
goto :eof

:DoBuild
echo Building JSX Script...
node scripts/build.js
if %errorlevel% neq 0 (
    echo JSX Build Failed!
    exit /b 1
)

echo.
echo Building Installer...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup.iss
if %errorlevel% neq 0 (
    echo Installer Build Failed!
    exit /b 1
)
echo Build Success.
exit /b 0
