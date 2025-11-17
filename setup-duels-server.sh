#!/bin/bash

# Flappy Pi Duels Server Setup Script
# This script sets up the real-time multiplayer duels server using Socket.IO

echo "🎮 Setting up Flappy Pi Duels Server..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Create duels server directory
DUELS_DIR="duels-server"
if [ -d "$DUELS_DIR" ]; then
    echo "📁 Duels server directory already exists. Updating..."
    cd "$DUELS_DIR"
else
    echo "📁 Creating duels server directory..."
    mkdir "$DUELS_DIR"
    cd "$DUELS_DIR"
fi

# Copy server files
echo "📄 Copying server files..."
cp ../server-duels.js .
cp ../package-duels.json package.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create start script
echo "🚀 Creating start script..."
cat > start-duels.sh << 'EOF'
#!/bin/bash
echo "🎮 Starting Flappy Pi Duels Server..."
echo "====================================="
echo "Server will run on: http://localhost:3001"
echo "Health check: http://localhost:3001/health"
echo "Available rooms: http://localhost:3001/api/rooms"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server-duels.js
EOF

chmod +x start-duels.sh

# Create development script
echo "🔧 Creating development script..."
cat > dev-duels.sh << 'EOF'
#!/bin/bash
echo "🎮 Starting Flappy Pi Duels Server (Development Mode)..."
echo "======================================================="
echo "Server will run on: http://localhost:3001"
echo "Auto-restart enabled for development"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npx nodemon server-duels.js
EOF

chmod +x dev-duels.sh

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << 'EOF'
# Flappy Pi Duels Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://flappypi.pinet.com

# Server Settings
MAX_ROOMS=100
MAX_PLAYERS_PER_ROOM=2
GAME_TIMEOUT=300000

# Logging
LOG_LEVEL=info
EOF

# Create README
echo "📖 Creating documentation..."
cat > README.md << 'EOF'
# Flappy Pi Duels Server

Real-time multiplayer duels server for Flappy Pi using Socket.IO.

## Features

- 🎮 Real-time multiplayer duels
- 🏠 Room-based matchmaking
- ⚡ WebSocket communication
- 🔄 Auto-reconnection
- 📊 Health monitoring
- 🎯 Game state synchronization

## Quick Start

### Start Server
```bash
./start-duels.sh
```

### Development Mode
```bash
./dev-duels.sh
```

## API Endpoints

- `GET /health` - Server health check
- `GET /api/rooms` - List available rooms

## Socket.IO Events

### Client → Server
- `join_lobby` - Join the lobby
- `create_room` - Create a new game room
- `join_room` - Join an existing room
- `leave_room` - Leave current room
- `player_ready` - Set player ready state
- `start_game` - Start the game (host only)
- `game_action` - Send game action

### Server → Client
- `lobby_joined` - Lobby joined confirmation
- `room_created` - New room created
- `room_deleted` - Room deleted
- `player_joined` - Player joined room
- `player_left` - Player left room
- `player_ready_changed` - Player ready state changed
- `game_started` - Game started
- `game_state_update` - Game state update
- `game_ended` - Game ended

## Configuration

Edit `.env` file to configure:
- Port number
- CORS origins
- Max rooms and players
- Game timeout

## Troubleshooting

1. **Port already in use**: Change PORT in .env file
2. **CORS errors**: Add your domain to CORS_ORIGINS
3. **Connection failed**: Check if server is running on correct port

## Development

- Server auto-restarts on file changes in dev mode
- Check console for connection logs
- Use browser dev tools to monitor WebSocket connections
EOF

echo ""
echo "🎉 Duels Server Setup Complete!"
echo "==============================="
echo ""
echo "📁 Server directory: ./$DUELS_DIR"
echo "🚀 Start server: cd $DUELS_DIR && ./start-duels.sh"
echo "🔧 Development: cd $DUELS_DIR && ./dev-duels.sh"
echo ""
echo "🌐 Server will run on: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/health"
echo "📋 Available rooms: http://localhost:3001/api/rooms"
echo ""
echo "📖 Documentation: ./$DUELS_DIR/README.md"
echo ""
echo "🎮 Ready to start multiplayer duels!"
