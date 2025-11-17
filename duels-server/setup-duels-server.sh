#!/bin/bash

# Flappy Pi Duels Server Setup Script
# This script sets up the complete Socket.IO duels server environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}$1${NC}"
}

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

# Function to check system requirements
check_requirements() {
    print_header "🔍 Checking System Requirements"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        echo "   Download from: https://nodejs.org/"
        echo "   Or use a version manager like nvm: https://github.com/nvm-sh/nvm"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        echo "   Please upgrade Node.js from: https://nodejs.org/"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "System requirements check passed"
    print_status "Node.js version: $(node -v)"
    print_status "npm version: $(npm -v)"
}

# Function to create directory structure
setup_directories() {
    print_header "📁 Setting Up Directory Structure"
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p utils
    mkdir -p config
    
    print_success "Directory structure created"
}

# Function to install dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies"
    
    print_status "Installing production dependencies..."
    npm install --production
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install production dependencies"
        exit 1
    fi
    
    print_status "Installing development dependencies..."
    npm install --save-dev
    
    if [ $? -ne 0 ]; then
        print_warning "Failed to install development dependencies (optional)"
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to create configuration files
setup_configuration() {
    print_header "⚙️ Setting Up Configuration"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env configuration file..."
        cat > .env << EOF
# Flappy Pi Duels Server Configuration
# Copy this file to .env and adjust values as needed

# Server Configuration
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

# Performance Configuration
CONNECTION_TIMEOUT=30000
PING_TIMEOUT=5000
PING_INTERVAL=25000
EOF
        print_success "Created .env configuration file"
    else
        print_status ".env file already exists"
    fi
}

# Function to set up logging
setup_logging() {
    print_header "📝 Setting Up Logging"
    
    # Create logs directory
    mkdir -p logs
    
    # Create log rotation script
    cat > rotate-logs.sh << 'EOF'
#!/bin/bash
# Log rotation script for Flappy Pi Duels Server

LOG_DIR="logs"
MAX_LOGS=7

# Rotate logs
for i in $(seq $MAX_LOGS -1 1); do
    if [ -f "$LOG_DIR/duels-server-$((i-1)).log" ]; then
        mv "$LOG_DIR/duels-server-$((i-1)).log" "$LOG_DIR/duels-server-$i.log"
    fi
done

# Remove old logs
find $LOG_DIR -name "duels-server-*.log" -mtime +$MAX_LOGS -delete

echo "Log rotation completed"
EOF
    
    chmod +x rotate-logs.sh
    print_success "Logging setup completed"
}

# Function to create systemd service (Linux)
setup_systemd_service() {
    if command -v systemctl &> /dev/null; then
        print_header "🔧 Setting Up Systemd Service (Linux)"
        
        # Create systemd service file
        sudo tee /etc/systemd/system/flappypi-duels.service > /dev/null << EOF
[Unit]
Description=Flappy Pi Duels Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) server-duels.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        # Reload systemd and enable service
        sudo systemctl daemon-reload
        sudo systemctl enable flappypi-duels.service
        
        print_success "Systemd service created and enabled"
        print_status "Use 'sudo systemctl start flappypi-duels' to start the service"
        print_status "Use 'sudo systemctl status flappypi-duels' to check status"
    fi
}

# Function to create PM2 configuration
setup_pm2() {
    if command -v pm2 &> /dev/null; then
        print_header "🚀 Setting Up PM2 Process Manager"
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'flappypi-duels',
    script: 'server-duels.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
EOF
        
        print_success "PM2 configuration created"
        print_status "Use 'pm2 start ecosystem.config.js' to start with PM2"
    fi
}

# Function to run tests
run_tests() {
    print_header "🧪 Running Tests"
    
    # Check if server starts without errors
    print_status "Testing server startup..."
    timeout 10s node server-duels.js &
    SERVER_PID=$!
    sleep 3
    
    # Check if server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "Server startup test passed"
        kill $SERVER_PID 2>/dev/null || true
    else
        print_warning "Server startup test failed"
    fi
}

# Function to display final instructions
show_final_instructions() {
    print_header "🎉 Setup Complete!"
    
    echo ""
    echo "Your Flappy Pi Duels Server is ready to use!"
    echo ""
    echo "📋 Quick Start Commands:"
    echo "  • Start server: ./start-duels.sh"
    echo "  • Development: npm run dev"
    echo "  • Production: npm start"
    echo ""
    echo "🔗 Server Endpoints:"
    echo "  • Health check: http://localhost:3009/health"
    echo "  • Available rooms: http://localhost:3009/api/rooms"
    echo "  • Server stats: http://localhost:3009/api/stats"
    echo ""
    echo "📁 Important Files:"
    echo "  • Configuration: .env"
    echo "  • Logs: logs/"
    echo "  • Startup script: start-duels.sh"
    echo ""
    echo "🛠️ Development:"
    echo "  • Edit .env for configuration changes"
    echo "  • Check logs/ for debugging"
    echo "  • Use npm run dev for auto-restart"
    echo ""
    echo "🚀 Production:"
    echo "  • Use PM2: pm2 start ecosystem.config.js"
    echo "  • Or systemd: sudo systemctl start flappypi-duels"
    echo ""
    print_success "Setup completed successfully!"
}

# Main execution
main() {
    echo "🎮 Flappy Pi Duels Server Setup"
    echo "================================"
    echo ""
    
    check_requirements
    setup_directories
    install_dependencies
    setup_configuration
    setup_logging
    setup_pm2
    setup_systemd_service
    run_tests
    show_final_instructions
}

# Run main function
main
