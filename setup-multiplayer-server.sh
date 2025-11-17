#!/bin/bash

# Flappy Pi Multiplayer Server Setup Script
echo "🚀 Setting up Flappy Pi Multiplayer Server..."

# Create multiplayer server directory
mkdir -p multiplayer-server
cd multiplayer-server

# Copy server files
cp ../server-multiplayer.js .
cp ../package-multiplayer.json package.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
cat > .env << EOF
PORT=3001
NODE_ENV=development
WEBSOCKET_URL=ws://localhost:3001
EOF

# Create start script
cat > start-server.sh << 'EOF'
#!/bin/bash
echo "🎮 Starting Flappy Pi Multiplayer Server..."
echo "📡 WebSocket Server: ws://localhost:3001"
echo "🏠 Health Check: http://localhost:3001/health"
echo "📋 Active Rooms: http://localhost:3001/rooms"
echo ""
node server-multiplayer.js
EOF

chmod +x start-server.sh

# Create development script
cat > dev-server.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting Flappy Pi Multiplayer Server in Development Mode..."
echo "📡 WebSocket Server: ws://localhost:3001"
echo "🏠 Health Check: http://localhost:3001/health"
echo "📋 Active Rooms: http://localhost:3001/rooms"
echo ""
nodemon server-multiplayer.js
EOF

chmod +x dev-server.sh

echo "✅ Multiplayer server setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   cd multiplayer-server"
echo "   ./start-server.sh"
echo ""
echo "🔧 To start in development mode:"
echo "   cd multiplayer-server"
echo "   ./dev-server.sh"
echo ""
echo "📡 Server will run on: http://localhost:3001"
echo "🌐 WebSocket endpoint: ws://localhost:3001"
