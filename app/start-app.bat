@echo off
echo =========================================
echo    ANGULAR APPLICATION STARTUP SCRIPT
echo =========================================

echo Stopping any running processes on port 4200...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :4200 ^| findstr LISTENING') DO (
  echo Killing process with PID %%T
  taskkill /F /PID %%T
)

echo.
echo Checking for required dependencies...
echo.
echo Installing Stripe.js if needed...
call npm list @stripe/stripe-js || npm install @stripe/stripe-js --save

echo.
echo Setting up proxy for API calls...
echo The proxy configuration will forward API calls to your backend without CORS issues.
echo.

echo =========================================
echo   CONFIGURATION CHECKLIST
echo =========================================
echo 1. Make sure your backend API is running on http://localhost:5188
echo 2. Verify Stripe keys are properly configured in both frontend and backend
echo 3. Check that JWT authentication is properly set up on the backend
echo.
echo See backend-fixes.md for detailed backend configuration instructions
echo.

echo Starting Angular application with proxy configuration...
call ng serve --open

echo.
echo If you encounter any issues, check the console for errors.
echo.
