# Fix Audio Echo - Disable Microphone Monitoring in Windows
# This script helps prevent echo by disabling "Listen to this device" on your microphone

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  BuzzBuzzGPTs - Audio Echo Fix Utility" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will help fix the echo issue when using system audio capture." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Windows Sound Settings..." -ForegroundColor Green
Write-Host ""

# Open Sound Control Panel
Start-Process "control.exe" -ArgumentList "mmsys.cpl"

Write-Host "Please follow these steps in the Sound window that just opened:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to the 'Recording' tab" -ForegroundColor White
Write-Host "2. Find your Microphone device and double-click it" -ForegroundColor White
Write-Host "3. Go to the 'Listen' tab" -ForegroundColor White
Write-Host "4. UNCHECK the box 'Listen to this device'" -ForegroundColor Yellow
Write-Host "5. Click 'Apply' then 'OK'" -ForegroundColor White
Write-Host ""
Write-Host "This prevents your microphone from playing through speakers," -ForegroundColor Gray
Write-Host "which causes the echo when using system audio capture." -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
