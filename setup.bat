@echo off
REM Truck4You - Quick Setup Script for Windows
REM This script automates the initial setup process

echo.
echo 🚚 Truck4You - Automated Setup Script
echo ======================================
echo.

REM Check Node.js
echo 📋 Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

REM Check PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL is not installed or not in PATH.
    echo    You'll need to install PostgreSQL 14+ or use Docker.
    echo.
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
echo ✅ Dependencies installed

REM Setup backend environment
echo.
echo 🔧 Setting up backend environment...
cd packages\backend

if not exist .env (
    copy .env.example .env
    echo ✅ Created packages\backend\.env
    echo ⚠️  Please edit packages\backend\.env and set your DATABASE_URL
) else (
    echo ℹ️  .env already exists in packages\backend
)

REM Setup frontend environment
echo.
echo 🔧 Setting up frontend environment...
cd ..\frontend

if not exist .env (
    copy .env.example .env
    echo ✅ Created packages\frontend\.env
) else (
    echo ℹ️  .env already exists in packages\frontend
)

cd ..\..

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo.
echo 1. Set up your PostgreSQL database:
echo    psql -U postgres
echo    CREATE DATABASE truck4you;
echo.
echo 2. Update packages\backend\.env with your database credentials
echo.
echo 3. Run database migrations:
echo    cd packages\backend
echo    npx prisma generate
echo    npx prisma migrate dev
echo.
echo 4. Start the application:
echo    npm run dev
echo.
echo 5. Open http://localhost:5173 in your browser
echo.
echo For detailed instructions, see QUICK_START.md
echo.
pause
