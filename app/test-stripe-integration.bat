@echo off
cls
echo ===================================================
echo       Stripe Integration Test Script
echo ===================================================
echo.

echo This script will help you test your Stripe integration
echo and ensure all the fixes are working correctly.
echo.

echo Step 1: Testing frontend configuration...
cd "%~dp0"
powershell -Command "$content = Get-Content -Path './src/index.html' -Raw; if ($content -match 'unsafe-inline' -and $content -match 'js.stripe.com') { Write-Host '   OK: CSP configuration looks good' -ForegroundColor Green } else { Write-Host '   WARNING: CSP configuration may be missing required settings!' -ForegroundColor Yellow }"

echo.
echo Step 2: Checking backend configuration...
echo   Make sure your backend is running with the updated code.
echo   The following changes were made:
echo   - Added tax calculation (10%%)
echo   - Updated HandleSuccessfulPayment to clear cart and create order
echo   - Added email confirmation placeholder
echo.

echo Step 3: Checking Cart and Order services...
echo   Frontend has been updated to:
echo   - Clear cart after successful payment
echo   - Create order record in order history
echo.

echo Now let's run a test purchase:
echo   1. Start your backend (dotnet run)
echo   2. Start your frontend (ng serve)
echo   3. Add items to cart
echo   4. Go through checkout with test card: 4242 4242 4242 4242
echo   5. Check that you're redirected to success page
echo   6. Verify cart is emptied
echo   7. Check that order appears in order history
echo.

echo Press any key to start the frontend...
pause > nul

echo Starting Angular app...
start /B cmd /c "ng serve"

echo.
echo Press any key to exit...
pause > nul
