@echo off
REM BuzzBuzzGPTs Build and Checksum Generator (Batch version)
REM For users who prefer .bat files over PowerShell

echo.
echo ========================================
echo   BuzzBuzzGPTs Build ^& Distribution Tool
echo ========================================
echo.

REM Check if icon exists
if not exist "build\icon.ico" (
    echo NOTE: build\icon.ico not found.
    echo The build will use Electron's default icon.
    echo.
    echo To add a custom icon later:
    echo   1. Create build\icon.ico ^(see build\README-ICON.md^)
    echo   2. Uncomment icon lines in package.json
    echo   3. Rebuild
    echo.
)

REM Build
echo [1/3] Building Windows installer...
echo This may take 5-10 minutes on first build...
echo.

call npm run build:win

if errorlevel 1 (
    echo.
    echo Build failed! Check the errors above.
    echo Common fixes:
    echo   - Run: npm install
    echo   - Delete the dist/ folder and try again
    echo   - See BUILD.md for troubleshooting
    echo.
    exit /b 1
)

echo.
echo Build successful!

REM Find installer
echo.
echo [2/3] Locating installer...

for %%f in (dist\*Setup*.exe) do set INSTALLER=%%f

if not defined INSTALLER (
    echo ERROR: No installer found in dist/ folder
    exit /b 1
)

echo Found: %INSTALLER%
echo.

REM Generate checksum
echo [3/3] Generating SHA256 checksum...
echo.

certutil -hashfile "%INSTALLER%" SHA256 > dist\checksum-temp.txt

REM Extract just the hash (second line)
for /f "skip=1 tokens=*" %%a in (dist\checksum-temp.txt) do (
    set CHECKSUM=%%a
    goto :done
)
:done

del dist\checksum-temp.txt

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Installer: %INSTALLER%
echo.
echo SHA256 Checksum:
echo %CHECKSUM%
echo.

REM Save checksum to file
(
echo BuzzBuzzGPTs Installer Checksum
echo ========================================
echo.
echo File: %INSTALLER%
echo Date: %DATE% %TIME%
echo.
echo SHA256:
echo %CHECKSUM%
echo.
echo ========================================
echo.
echo To verify:
echo   certutil -hashfile "%INSTALLER%" SHA256
echo.
echo The output should match the checksum above.
) > dist\CHECKSUM-SHA256.txt

echo Checksum saved to: dist\CHECKSUM-SHA256.txt
echo.

echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Test the installer
2. Update documentation with checksum
3. Upload and distribute
echo.
echo See QUICK-START-DISTRIBUTION.md for complete guide.
echo.

REM Open dist folder
start explorer dist

echo Done! 🎉
echo.
pause
