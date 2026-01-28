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
echo.
echo --- Cleaning up old Illustrator instances ---
taskkill /IM Illustrator.exe /F 2>nul
timeout /t 2 /nobreak >nul

echo.
echo --- Running Installer (Auto-Load Action) ---
echo Please complete the installation...
:: Run installer and tell it to Keep Illustrator Open after loading action
start /wait AutoCloneTranslationSetup.exe /ExtraArgs="-KeepOpen"

echo.
echo Done! Illustrator should be open with Action loaded.



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
