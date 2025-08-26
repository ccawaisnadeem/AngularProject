@echo off
echo.
echo ============================================
echo       Stripe URL Configuration Checker
echo ============================================
echo.

echo Checking frontend URL configuration...
powershell -Command "$content = Get-Content -Path '.\src\environments\environment.ts' -Raw; if ($content -match 'frontendUrl') { Write-Host '  Frontend URL found in environment.ts' -ForegroundColor Green } else { Write-Host '  WARNING: frontendUrl may be missing in environment.ts!' -ForegroundColor Red }"
echo.

echo Checking backend URL configuration in appsettings.json...
echo   Make sure your backend has these settings:
echo   "FRONTEND_URL": "http://localhost:4200"
echo.

echo Checking for the specific "Not a valid URL" error...
echo   This error usually means one of these issues:
echo   1. imageUrl in line items is an invalid URL (should be full URL or null, not empty string)
echo   2. The FRONTEND_URL in backend configuration is not set correctly
echo   3. The success/cancel URLs being generated are malformed
echo.

echo Recommended fixes:
echo   1. Ensure imageUrl is either null or a full valid URL (http://...)
echo   2. Check that your backend's appsettings.json has:
echo      "FRONTEND_URL": "http://localhost:4200"
echo   3. Ensure StripeCheckoutController is correctly building the success/cancel URLs
echo.

echo Here are the relevant code sections from your controller:
echo.
echo options.SuccessUrl = $"{_configuration["FRONTEND_URL"]}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}";
echo options.CancelUrl = $"{_configuration["FRONTEND_URL"]}/checkout/cancel";
echo.

echo Verifying that you have success and cancel routes defined...
powershell -Command "$routes = Get-Content -Path '.\src\app\app.routes.ts' -Raw; if ($routes -match 'checkout/success' -and $routes -match 'checkout/cancel') { Write-Host '  Success/cancel routes found' -ForegroundColor Green } else { Write-Host '  WARNING: You may be missing checkout success or cancel routes!' -ForegroundColor Red }"
echo.

echo Steps to fix the "Not a valid URL" error:
echo   1. Set imageUrl to null instead of '' in your checkout component
echo   2. Make sure your checkout success and cancel components are defined
echo   3. Ensure your backend has the FRONTEND_URL set correctly
echo   4. Restart both frontend and backend applications
echo.

echo Press any key to exit...
pause > nul
