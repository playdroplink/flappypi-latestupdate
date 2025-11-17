#!/bin/bash

# Leaderboard Server Setup Script
# This script sets up the Socket.IO leaderboard server for real-time score updates

echo "🚀 Setting up Flappy Pi Leaderboard Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create package.json for the leaderboard server
cat > package-leaderboard.json << 'EOF'
{
  "name": "flappy-pi-leaderboard-server",
  "version": "1.0.0",
  "description": "Socket.IO server for Flappy Pi real-time leaderboard",
  "main": "server-leaderboard.js",
  "scripts": {
    "start": "node server-leaderboard.js",
    "dev": "nodemon server-leaderboard.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.5",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": [
    "socket.io",
    "leaderboard",
    "real-time",
    "flappy-pi"
  ],
  "author": "Flappy Pi Team",
  "license": "MIT"
}
EOF

echo "📦 Created package-leaderboard.json"

# Install dependencies
echo "📥 Installing dependencies..."
npm install --prefix . express@^4.18.2 socket.io@^4.7.5 cors@^2.8.5 --save --package-lock-only --package-lock=package-leaderboard-lock.json

# Create start script
cat > start-leaderboard-server.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Flappy Pi Leaderboard Server..."

# Check if the server file exists
if [ ! -f "server-leaderboard.js" ]; then
    echo "❌ server-leaderboard.js not found!"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install express@^4.18.2 socket.io@^4.7.5 cors@^2.8.5
fi

# Start the server
echo "🌟 Starting server on port 3002..."
node server-leaderboard.js
EOF

chmod +x start-leaderboard-server.sh

# Create development start script
cat > start-leaderboard-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Flappy Pi Leaderboard Server (Development Mode)..."

# Check if the server file exists
if [ ! -f "server-leaderboard.js" ]; then
    echo "❌ server-leaderboard.js not found!"
    exit 1
fi

# Install nodemon if not present
if ! command -v nodemon &> /dev/null; then
    echo "📦 Installing nodemon for development..."
    npm install -g nodemon
fi

# Start the server with nodemon
echo "🌟 Starting server with auto-reload on port 3002..."
nodemon server-leaderboard.js
EOF

chmod +x start-leaderboard-dev.sh

# Create health check script
cat > check-leaderboard-server.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking Flappy Pi Leaderboard Server..."

# Check if server is running
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Leaderboard server is running!"
    echo "📊 Server status:"
    curl -s http://localhost:3002/health | jq '.' 2>/dev/null || curl -s http://localhost:3002/health
else
    echo "❌ Leaderboard server is not running!"
    echo "💡 Start it with: ./start-leaderboard-server.sh"
    exit 1
fi
EOF

chmod +x check-leaderboard-server.sh

# Create stop script
cat > stop-leaderboard-server.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Flappy Pi Leaderboard Server..."

# Find and kill the server process
PID=$(lsof -ti:3002)
if [ ! -z "$PID" ]; then
    kill $PID
    echo "✅ Server stopped (PID: $PID)"
else
    echo "ℹ️  No server running on port 3002"
fi
EOF

chmod +x stop-leaderboard-server.sh

echo ""
echo "🎉 Leaderboard server setup complete!"
echo ""
echo "📋 Available commands:"
echo "  ./start-leaderboard-server.sh    - Start the server"
echo "  ./start-leaderboard-dev.sh       - Start in development mode (auto-reload)"
echo "  ./check-leaderboard-server.sh    - Check server status"
echo "  ./stop-leaderboard-server.sh     - Stop the server"
echo ""
echo "🌐 Server will be available at:"
echo "  http://localhost:3002/health      - Health check"
echo "  http://localhost:3002/api/leaderboard/:gameMode - API endpoint"
echo ""
echo "🔌 Socket.IO will be available at:"
echo "  ws://localhost:3002               - WebSocket connection"
echo ""
echo "💡 To start the server now, run:"
echo "  ./start-leaderboard-server.sh"
echo ""
echo "📚 For more information, check the Socket.IO documentation:"
echo "  https://socket.io/docs/v4/server-api/"
echo "  https://socket.io/docs/v4/client-api/"
