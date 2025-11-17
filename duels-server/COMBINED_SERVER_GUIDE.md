# 🎮 Combined Duels + Leaderboard Server Guide

## 🚀 **Quick Start**

### **Start the Combined Server:**
```bash
# Windows
cd duels-server
start-combined.bat

# Linux/Mac
cd duels-server
./start-combined.sh

# Or manually
node server-combined.js
```

## 🏆 **What's Included**

### **✅ Duels Features:**
- Real-time multiplayer PvP duels
- Room creation and joining
- Player matchmaking
- Game state synchronization
- Enhanced Socket.IO with rate limiting

### **✅ Leaderboard Features:**
- Real-time leaderboard updates
- Score submission and ranking
- Multiple game modes (classic, endless, challenge)
- Live ranking updates
- User rank tracking

## 🔧 **Server Endpoints**

### **Health Check:**
```
GET http://localhost:3009/health
```

### **Available Rooms:**
```
GET http://localhost:3009/api/rooms
```

### **Leaderboard Data:**
```
GET http://localhost:3009/api/leaderboard/classic
GET http://localhost:3009/api/leaderboard/endless
GET http://localhost:3009/api/leaderboard/challenge
```

### **Server Statistics:**
```
GET http://localhost:3009/api/stats
```

## 🎮 **How to Test**

### **1. Start the Server:**
```bash
cd duels-server
node server-combined.js
```

You should see:
```
🎮 Combined Duels + Leaderboard Server running on localhost:3009
📡 Socket.IO server ready for real-time multiplayer and leaderboard
🏥 Health check: http://localhost:3009/health
```

### **2. Test Health Check:**
```bash
curl http://localhost:3009/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "activeRooms": 0,
  "connectedPlayers": 0,
  "leaderboardEntries": 0,
  "memory": {
    "used": 45,
    "total": 67,
    "external": 12
  }
}
```

### **3. Test in Browser:**
1. Open your Flappy Pi app
2. Click "⚔️ Enhanced PvP Duels"
3. Enter your player name
4. You should see the duels lobby with "Create Room" and "Join Room" buttons

### **4. Test Leaderboard:**
```bash
# Test leaderboard endpoint
curl http://localhost:3009/api/leaderboard/classic

# Test rooms endpoint
curl http://localhost:3009/api/rooms

# Test server stats
curl http://localhost:3009/api/stats
```

## 🎯 **Socket.IO Events**

### **Duels Events:**
- `join_lobby` - Join the duels lobby
- `create_room` - Create a new game room
- `join_room` - Join an existing room
- `leave_room` - Leave current room
- `player_ready` - Mark player as ready
- `start_game` - Start the game
- `game_action` - Send game actions

### **Leaderboard Events:**
- `join_leaderboard` - Join leaderboard updates
- `leave_leaderboard` - Leave leaderboard updates
- `submit_score` - Submit a score
- `get_user_rank` - Get user's rank

## 🔍 **Troubleshooting**

### **Issue: "Server Offline" Message**
- Make sure the server is running
- Check if port 3009 is available
- Try refreshing the browser

### **Issue: Can't Connect to Server**
- Check firewall settings
- Verify the server is running on localhost:3009
- Check browser console for errors

### **Issue: Leaderboard Not Updating**
- Make sure you're connected to the server
- Check if score submission is working
- Verify the game mode is correct

## 📊 **Monitoring**

### **Real-time Stats:**
- Active rooms: `GET /api/rooms`
- Server health: `GET /health`
- Leaderboard data: `GET /api/leaderboard/{gameMode}`
- Server statistics: `GET /api/stats`

### **Logs:**
The server provides detailed logging for:
- Connection events
- Room management
- Game actions
- Leaderboard updates
- Error handling

## 🎮 **Game Flow**

### **1. Player Joins:**
- Player enters name
- Connects to server
- Joins duels lobby

### **2. Room Creation/Joining:**
- Host creates room with settings
- Players join room
- Players mark as ready

### **3. Game Start:**
- Host starts game
- Real-time game synchronization
- Score tracking

### **4. Score Submission:**
- Scores submitted to leaderboard
- Real-time ranking updates
- User rank tracking

## 🚀 **Production Deployment**

### **Environment Variables:**
```bash
NODE_ENV=production
PORT=3009
HOST=0.0.0.0
```

### **PM2 Process Manager:**
```bash
npm install -g pm2
pm2 start server-combined.js --name "duels-leaderboard"
pm2 save
pm2 startup
```

### **Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3009
CMD ["node", "server-combined.js"]
```

## 🎯 **Next Steps**

1. **Start the server** using the scripts above
2. **Test the health check** to verify it's running
3. **Open your Flappy Pi app** and test the duels
4. **Check the leaderboard** updates in real-time
5. **Monitor the server logs** for any issues

The combined server provides both multiplayer duels and real-time leaderboard functionality in a single, efficient package! 🚀
