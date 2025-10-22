#!/bin/bash

# AgriTrade Manager Deployment Script
echo "🚀 AgriTrade Manager Deployment Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm --prefix backend install
npm --prefix frontend install

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "📝 Please edit backend/.env with your MongoDB URI and JWT secret"
    echo "   MONGO_URI=mongodb://localhost:27017/agritrade"
    echo "   JWT_SECRET=your-super-secret-jwt-key-here"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Seed database
echo "🌱 Seeding database..."
npm run seed

# Start development servers
echo "🚀 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000/api"
echo "   Login: admin@agritrade.com / admin123"
echo ""
echo "Press Ctrl+C to stop servers"

npm run dev
