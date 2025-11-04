#!/bin/bash

# Truck4You - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚚 Truck4You - Automated Setup Script"
echo "======================================"
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "   You'll need to install PostgreSQL 14+ or use Docker."
    echo ""
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Setup backend environment
echo ""
echo "🔧 Setting up backend environment..."
cd packages/backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created packages/backend/.env"
    echo "⚠️  Please edit packages/backend/.env and set your DATABASE_URL"
else
    echo "ℹ️  .env already exists in packages/backend"
fi

# Setup frontend environment
echo ""
echo "🔧 Setting up frontend environment..."
cd ../frontend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created packages/frontend/.env"
else
    echo "ℹ️  .env already exists in packages/frontend"
fi

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Set up your PostgreSQL database:"
echo "   psql -U postgres"
echo "   CREATE DATABASE truck4you;"
echo ""
echo "2. Update packages/backend/.env with your database credentials"
echo ""
echo "3. Run database migrations:"
echo "   cd packages/backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "For detailed instructions, see QUICK_START.md"
