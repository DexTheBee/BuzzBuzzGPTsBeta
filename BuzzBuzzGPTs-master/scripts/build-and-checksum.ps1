# BuzzBuzzGPTs Build and Checksum Generator
# Run this script to build the installer and generate SHA256 checksum

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  BuzzBuzzGPTs Build & Distribution Tool" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if icon exists
if (-not (Test-Path "build\icon.ico")) {
    Write-Host "NOTE: build\icon.ico not found." -ForegroundColor Yellow
    Write-Host "The build will use Electron's default icon.`n" -ForegroundColor Yellow
    Write-Host "To add a custom icon later:" -ForegroundColor Gray
    Write-Host "  1. Create build\icon.ico (see build\README-ICON.md)" -ForegroundColor Gray
    Write-Host "  2. Uncomment icon lines in package.json" -ForegroundColor Gray
    Write-Host "  3. Rebuild`n" -ForegroundColor Gray
}

# Step 1: Build
Write-Host "[1/3] Building Windows installer..." -ForegroundColor Green
Write-Host "This may take 5-10 minutes on first build...`n" -ForegroundColor Gray

npm run build:win

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed! Check the errors above." -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  - Run: npm install" -ForegroundColor Yellow
    Write-Host "  - Delete the dist/ folder and try again" -ForegroundColor Yellow
    Write-Host "  - See BUILD.md for troubleshooting`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nBuild successful!" -ForegroundColor Green

# Step 2: Find installer
Write-Host "`n[2/3] Locating installer..." -ForegroundColor Green

$installers = Get-ChildItem -Path "dist" -Filter "*.exe" -File | Where-Object { $_.Name -like "*Setup*" }

if ($installers.Count -eq 0) {
    Write-Host "ERROR: No installer found in dist/ folder" -ForegroundColor Red
    exit 1
}

$installer = $installers[0]
$installerPath = $installer.FullName
$installerSize = [math]::Round($installer.Length / 1MB, 2)

Write-Host "Found: $($installer.Name)" -ForegroundColor Cyan
Write-Host "Size: $installerSize MB" -ForegroundColor Gray
Write-Host "Path: $installerPath`n" -ForegroundColor Gray

# Step 3: Generate checksum
Write-Host "[3/3] Generating SHA256 checksum..." -ForegroundColor Green

$hash = Get-FileHash -Path $installerPath -Algorithm SHA256
$checksum = $hash.Hash

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Installer:" -ForegroundColor Cyan
Write-Host "  $($installer.Name)" -ForegroundColor White
Write-Host "  Location: $installerPath" -ForegroundColor Gray
Write-Host "  Size: $installerSize MB`n" -ForegroundColor Gray

Write-Host "SHA256 Checksum:" -ForegroundColor Cyan
Write-Host "  $checksum`n" -ForegroundColor White

# Save checksum to file
$checksumFile = Join-Path "dist" "CHECKSUM-SHA256.txt"
$checksumContent = @"
BuzzBuzzGPTs Installer Checksum
========================================

File: $($installer.Name)
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Size: $installerSize MB

SHA256:
$checksum

========================================

To verify:

PowerShell:
  Get-FileHash "$($installer.Name)" -Algorithm SHA256

Command Prompt:
  certutil -hashfile "$($installer.Name)" SHA256

The output should match the checksum above.
"@

$checksumContent | Out-File -FilePath $checksumFile -Encoding UTF8

Write-Host "Checksum saved to:" -ForegroundColor Green
Write-Host "  $checksumFile`n" -ForegroundColor Gray

# Next steps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Test the installer:" -ForegroundColor Yellow
Write-Host "   - Run: $installerPath" -ForegroundColor Gray
Write-Host "   - Click 'More info' → 'Run anyway' (SmartScreen)" -ForegroundColor Gray
Write-Host "   - Install and test all features`n" -ForegroundColor Gray

Write-Host "2. Update documentation:" -ForegroundColor Yellow
Write-Host "   - Add checksum to INSTALL.md" -ForegroundColor Gray
Write-Host "   - Update website download page" -ForegroundColor Gray
Write-Host "   - See DISTRIBUTION.md for templates`n" -ForegroundColor Gray

Write-Host "3. Distribute:" -ForegroundColor Yellow
Write-Host "   - Upload installer to your website/GitHub" -ForegroundColor Gray
Write-Host "   - Share the download link" -ForegroundColor Gray
Write-Host "   - Include the SHA256 checksum`n" -ForegroundColor Gray

Write-Host "See QUICK-START-DISTRIBUTION.md for complete guide.`n" -ForegroundColor Cyan

# Open dist folder
Write-Host "Opening dist folder..." -ForegroundColor Green
Start-Process "explorer.exe" -ArgumentList (Resolve-Path "dist")

Write-Host "`nDone! 🎉`n" -ForegroundColor Green
