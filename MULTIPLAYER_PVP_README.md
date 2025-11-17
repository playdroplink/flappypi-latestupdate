# 🎮 Flappy Pi Multiplayer PvP System

A comprehensive real-time multiplayer system for Flappy Pi using WebSocket technology, Socket.IO, and Node.js.

## 🚀 Features

### **Real-time Multiplayer Gameplay**
- **Live Player Movement**: Real-time position updates for all players
- **Synchronized Game State**: All players see the same game state
- **Instant Score Updates**: Real-time score broadcasting
- **Player Status Tracking**: Live/dead status for all players

### **Room Management System**
- **Create Rooms**: Host can create custom game rooms
- **Join Rooms**: Players can join via room codes
- **Room Settings**: Customizable game modes and settings
- **Player Limits**: Configurable maximum players per room

### **Game Modes**
- **Classic Mode**: Traditional Flappy Pi with obstacles
- **Endless Mode**: Survival mode with increasing difficulty
- **Race Mode**: First to finish line wins

### **Advanced Features**
- **Host Controls**: Room creator can start/end games
- **Player Authentication**: Pi Network user integration
- **Connection Status**: Real-time connection monitoring
- **Game Events**: Comprehensive event system
- **Error Handling**: Robust error management

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
```
src/
├── pages/MultiplayerPvPPage.tsx     # Main multiplayer page
├── services/multiplayerService.ts   # WebSocket service
└── components/                   # UI components
```

### **Backend (Node.js + Socket.IO)**
```
server-multiplayer.js               # WebSocket server
package-multiplayer.json            # Server dependencies
setup-multiplayer-server.sh        # Setup script
```

## 🛠️ Installation & Setup

### **1. Frontend Setup**
The multiplayer system is already integrated into the Flappy Pi app. No additional setup required.

### **2. Backend Server Setup**

#### **Quick Setup**
```bash
# Run the setup script
chmod +x setup-multiplayer-server.sh
./setup-multiplayer-server.sh
```

#### **Manual Setup**
```bash
# Create server directory
mkdir multiplayer-server
cd multiplayer-server

# Copy server files
cp ../server-multiplayer.js .
cp ../package-multiplayer.json package.json

# Install dependencies
npm install

# Start server
node server-multiplayer.js
```

### **3. Environment Configuration**

#### **Frontend (.env)**
```env
VITE_WEBSOCKET_URL=ws://localhost:3001
```

#### **Backend (.env)**
```env
PORT=3001
NODE_ENV=development
```

## 🎯 Usage

### **Starting the Multiplayer Server**
```bash
cd multiplayer-server
./start-server.sh
```

### **Development Mode**
```bash
cd multiplayer-server
./dev-server.sh
```

### **Accessing the Multiplayer Page**
1. Navigate to `/multiplayer` or `/pvp` in the Flappy Pi app
2. Create a room or join an existing one
3. Start playing with friends!

## 🔧 API Endpoints

### **Health Check**
```
GET /health
```
Returns server status and active room/player counts.

### **Active Rooms**
```
GET /rooms
```
Returns list of all active rooms with details.

## 📡 WebSocket Events

### **Client → Server Events**

#### **Room Management**
- `create_room` - Create a new game room
- `join_room` - Join an existing room
- `leave_room` - Leave current room

#### **Game Actions**
- `start_game` - Start the game (host only)
- `player_move` - Update player position
- `score_update` - Update player score
- `player_die` - Player died event

### **Server → Client Events**

#### **Connection Events**
- `connect` - Player connected
- `disconnect` - Player disconnected

#### **Room Events**
- `room_joined` - Successfully joined room
- `player_joined` - New player joined room
- `player_left` - Player left room

#### **Game Events**
- `game_started` - Game has started
- `game_ended` - Game has ended
- `player_moved` - Player position updated
- `player_died` - Player died
- `score_updated` - Player score updated

## 🎮 Game Flow

### **1. Lobby Phase**
- Players can create or join rooms
- Room settings can be configured
- Connection status is displayed

### **2. Room Phase**
- Players wait in the room
- Host can start the game
- Player list is displayed
- Room code is shown for sharing

### **3. Game Phase**
- Real-time gameplay begins
- All players see each other
- Scores are updated in real-time
- Game ends when conditions are met

### **4. Results Phase**
- Winner is announced
- Final scores are displayed
- Players can return to room or lobby

## 🔒 Security Features

### **Input Validation**
- All player inputs are validated
- Position updates are sanitized
- Score updates are verified

### **Rate Limiting**
- Movement updates are throttled
- Score updates have cooldowns
- Connection limits per IP

### **Error Handling**
- Graceful disconnection handling
- Automatic room cleanup
- Connection retry logic

## 🚀 Deployment

### **Production Deployment**
```bash
# Set production environment
export NODE_ENV=production
export PORT=3001

# Start server
node server-multiplayer.js
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server-multiplayer.js .
EXPOSE 3001
CMD ["node", "server-multiplayer.js"]
```

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **Active Rooms**
```bash
curl http://localhost:3001/rooms
```

### **Server Logs**
The server logs all important events:
- Player connections/disconnections
- Room creation/deletion
- Game start/end events
- Error conditions

## 🐛 Troubleshooting

### **Common Issues**

#### **Connection Failed**
- Check if server is running on port 3001
- Verify WebSocket URL in frontend
- Check firewall settings

#### **Room Not Found**
- Ensure room ID is correct
- Check if room still exists
- Verify server is running

#### **Game Not Starting**
- Ensure at least 2 players in room
- Check if host is starting the game
- Verify all players are ready

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=socket.io:* node server-multiplayer.js
```

## 🔮 Future Enhancements

### **Planned Features**
- **Spectator Mode**: Watch games without playing
- **Tournament System**: Organized competitions
- **Ranking System**: Player skill ratings
- **Custom Maps**: User-created game levels
- **Voice Chat**: In-game communication
- **Replay System**: Game recording and playback

### **Technical Improvements**
- **Redis Integration**: Persistent room storage
- **Load Balancing**: Multiple server instances
- **CDN Integration**: Global server distribution
- **Analytics**: Player behavior tracking
- **Anti-Cheat**: Server-side validation

## 📝 License

This multiplayer system is part of the Flappy Pi project and follows the same licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions about the multiplayer system:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**🎮 Happy Multiplayer Gaming! 🎮**
