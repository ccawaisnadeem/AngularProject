@echo off
echo =======================================================
echo    STARTING ANGULAR APP WITH STRIPE INTEGRATION
echo =======================================================
echo.

echo Step 1: Stopping any running instances on port 4200...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
    if errorlevel 0 echo Stopped process with PID: %%a
)

echo.
echo Step 2: Verifying dependencies...
call npm list @stripe/stripe-js >nul 2>&1
if errorlevel 1 (
    echo Installing @stripe/stripe-js...
    call npm install @stripe/stripe-js --save
) else (
    echo @stripe/stripe-js is already installed.
)

echo.
echo Step 3: Verifying Stripe configuration...

echo Checking environment.ts file...
findstr "stripePublishableKey" src\environments\environment.ts >nul
if errorlevel 1 (
    echo [91m❌ Stripe publishable key not found in environment.ts[0m
    echo Please make sure your environment.ts file has a valid stripePublishableKey.
) else (
    echo [92m✅ Stripe publishable key found in environment.ts[0m
)

echo.
echo Step 4: Checking backend connection...
curl -s http://localhost:5188/api/healthcheck >nul 2>&1
if errorlevel 1 (
    echo [93m⚠️ Backend API not detected. Make sure your ASP.NET Core backend is running on port 5188.[0m
    echo.
    echo To start your backend, open a new terminal and run:
    echo    dotnet run --project [your-backend-project].csproj
) else (
    echo [92m✅ Backend API is running[0m
)

echo.
echo Step 5: Starting Angular application with proxy configuration...
echo.
echo [93mIMPORTANT: If you encounter Stripe payment issues:[0m
echo  1. Check that your backend has the correct Stripe Secret Key
echo  2. Verify the [Authorize] attribute on backend endpoints
echo  3. Ensure you're logged in before attempting checkout
echo  4. Check browser console (F12) for detailed error messages
echo.
echo Starting application...
echo.

call ng serve --open
