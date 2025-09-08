@echo off
echo Running Angular build for Vercel deployment...

REM Ensure NODE_ENV is set to production
set NODE_ENV=production

REM Clean the dist folder if it exists
if exist "dist" (
  echo Cleaning dist folder...
  rmdir /s /q dist
)

REM Run the production build
echo Building Angular app for production...
call npm run build

REM Copy redirects file to output directory if not already there
if not exist "dist\app\_redirects" (
  echo Copying _redirects file for SPA routing...
  copy "public\_redirects" "dist\app\_redirects"
)

echo Build complete! Deploy to Vercel using:
echo vercel --prod
