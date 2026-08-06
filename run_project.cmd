@echo off
title College Placement Portal Control Center
color 0b
cls

echo ========================================================
echo          COLLEGE PLACEMENT PORTAL CONTROL CENTER
echo ========================================================
echo.
echo Please ensure you have:
echo  1. MySQL Server running on localhost:3306
echo  2. Java SDK 17+ installed and set in your PATH
echo  3. Node.js and npm installed
echo.
echo ========================================================
echo.

:menu
echo [1] Seed MySQL Database Schema (Requires root user with empty password)
echo [2] Start Spring Boot Backend API (Port 8080)
echo [3] Start React.js Frontend Server (Port 5173)
echo [4] Check System Environment & Requirements
echo [5] Exit
echo.
set /p choice="Select an option (1-5): "

if "%choice%"=="1" goto seed_db
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto check_env
if "%choice%"=="5" goto exit_app
echo Invalid option, please select between 1 and 5.
echo.
goto menu

:seed_db
echo.
echo [INFO] Attempting to import DDL/DML from schema.sql...
echo.
mysql -u root -p < schema.sql
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] MySQL database seeding failed. Check if MySQL root user exists or if database credentials match.
) else (
    echo.
    echo [SUCCESS] MySQL Database initialized and seeded with mock profiles successfully!
)
echo.
pause
cls
goto menu

:start_backend
echo.
echo [INFO] Starting Spring Boot Backend API...
echo.
cd backend
mvn spring-boot:run
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Spring Boot startup failed. Make sure port 8080 is free and maven dependencies compiled.
    cd ..
)
pause
cls
goto menu

:start_frontend
echo.
echo [INFO] Installing npm packages and starting Vite Dev Server...
echo.
npm install && npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vite server startup failed. Ensure Node.js/npm is installed on your path.
)
pause
cls
goto menu

:check_env
echo.
echo ========================================================
echo              Checking System Environment
echo ========================================================
echo.

:: Check Java
echo [CHECK] Java Runtime:
java -version
if %errorlevel% neq 0 (
    echo [ALERT] Java is not installed or configured in your PATH!
) else (
    echo [OK] Java is present.
)
echo.

:: Check Node
echo [CHECK] Node.js Runtime:
node -v
if %errorlevel% neq 0 (
    echo [ALERT] Node.js is not installed or configured in your PATH!
) else (
    echo [OK] Node.js is present.
)
echo.

:: Check MySQL
echo [CHECK] MySQL Command Line Client:
mysql --version
if %errorlevel% neq 0 (
    echo [WARN] mysql client is not found in your PATH. Option [1] will need manual import.
) else (
    echo [OK] mysql client is present.
)
echo.
pause
cls
goto menu

:exit_app
echo.
echo Thank you for using College Placement Portal Control Center!
echo Exiting...
exit
