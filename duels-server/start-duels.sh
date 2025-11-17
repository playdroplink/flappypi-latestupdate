#!/bin/bash

# Enhanced Flappy Pi Duels Server Startup Script
# This script starts the Socket.IO duels server with proper configuration and monitoring

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use"
        echo "Do you want to kill the existing process? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            print_error "Cannot start server on port $port"
            exit 1
        fi
    fi
}

# Function to create logs directory
setup_logs() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "Created logs directory"
    fi
}

# Function to check environment
check_environment() {
    print_status "Checking environment..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        echo "   Download from: https://nodejs.org/"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        echo "   Please upgrade Node.js from: https://nodejs.org/"
        exit 1
    fi

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the duels-server directory."
        exit 1
    fi

    print_success "Environment check passed"
}

# Function to install dependencies
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies"
            exit 1
        fi
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Function to create .env file if it doesn't exist
setup_environment() {
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cat > .env << EOF
# Flappy Pi Duels Server Configuration
PORT=3009
NODE_ENV=development
HOST=localhost

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://flappypi.pinet.com

# Game Configuration
MAX_ROOMS=100
MAX_PLAYERS_PER_ROOM=2
GAME_TIMEOUT=300000
GAME_TICK_RATE=60

# Security Configuration
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_RATE_LIMITING=true

# Logging Configuration
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
EOF
        print_success "Created .env file"
    fi
}

# Function to start server
start_server() {
    print_status "Starting Flappy Pi Duels Server..."
    print_status "Server will be available at:"
    echo "  🏥 Health check: http://localhost:3009/health"
    echo "  📋 Available rooms: http://localhost:3009/api/rooms"
    echo "  📊 Server stats: http://localhost:3009/api/stats"
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the server
    node server-duels.js
}

# Main execution
main() {
    echo "🎮 Flappy Pi Duels Server Startup"
    echo "=================================="
    
    check_environment
    setup_logs
    install_dependencies
    setup_environment
    check_port 3009
    
    start_server
}

# Handle script interruption
trap 'print_status "Shutting down server..."; exit 0' INT TERM

# Run main function
main