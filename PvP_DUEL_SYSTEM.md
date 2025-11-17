# 🎮 PvP Duel System for Flappy Pi

## Overview

The PvP Duel system allows players to challenge friends in asynchronous battles using **Ghost Mode**. Players record their gameplay runs, which are then replayed as "ghost" opponents for other players to compete against.

## 🏗️ Architecture

### Database Schema

The system uses the following Supabase tables:

- **`ghost_runs`** - Stores recorded gameplay data
- **`duels`** - Manages challenge requests and results  
- **`duel_history`** - Detailed records of completed duels
- **`tournaments`** - Weekly competitions
- **`tournament_participants`** - Tournament player data

### Core Components

1. **PvPDuelsPage** (`/pvp-duels`) - Main hub for PvP functionality
2. **PvPDuelPlayPage** (`/pvp-duels/play/:duelId`) - Actual duel gameplay
3. **pvpService** - Backend service for duel operations

## 🎯 Features

### Ghost Mode
- Records player's flap timestamps, bird positions, and pipe positions
- Replays opponent's run as a semi-transparent "ghost" bird
- Players compete against the ghost run in real-time

### Duel Management
- **Create Challenges** - Send duel requests to friends
- **Accept/Decline** - Respond to incoming challenges
- **Real-time Competition** - Play against ghost runs
- **Score Comparison** - Compare final scores to determine winner

### Tournament System
- **Weekly Tournaments** - Scheduled competitions
- **Leaderboards** - Track performance over time
- **Rewards** - Pi Tips and badges for winners

## 🚀 Getting Started

### 1. Database Setup

Run the updated schema in your Supabase SQL editor:

```sql
-- The schema is already included in supabase/schema.sql
-- This creates all necessary tables and functions
```

### 2. Access PvP Duels

Navigate to `/pvp-duels` or use the menu:
- **Menu Drawer** → Game Modes → PvP Duels
- **Home Page** → ⚔️ PvP Duels button

### 3. Create Your First Duel

1. Click "Challenge a Friend"
2. Search for an opponent by username
3. Select the opponent and create the challenge
4. The opponent receives a notification
5. When accepted, both players can compete

## 🎮 How to Play

### Creating a Ghost Run
1. Play a normal game session
2. Your run is automatically recorded
3. Use this run to challenge friends

### Competing in a Duel
1. Accept a duel challenge
2. Play against the ghost run
3. Try to beat the ghost's score
4. Higher score wins the duel

### Ghost Visualization
- **Your Bird** (Yellow) - Your current run
- **Ghost Bird** (White/Semi-transparent) - Opponent's recorded run
- **Ghost Pipes** (Semi-transparent) - Opponent's pipe layout

## 💰 Rewards System

### Duel Rewards
- **Winner**: 3 Pi Tips
- **Loser**: 1 Pi Tip (participation)
- **Tie**: 2 Pi Tips each

### Tournament Rewards
- **Top 10**: Pi Tips + Special Badge
- **Participation**: Tournament Badge

## 🔧 Technical Implementation

### Recording Game Data

```typescript
// Record flap timestamps
const flapTimestamps = [100, 250, 400, 550]; // milliseconds

// Record bird positions
const birdPositions = [
  { x: 100, y: 200 },
  { x: 100, y: 180 },
  // ... more positions
];

// Record pipe positions
const pipePositions = [
  { x: 480, y: 0, gap_y: 200 },
  { x: 600, y: 0, gap_y: 180 },
  // ... more pipes
];
```

### Ghost Replay System

```typescript
// Replay ghost run at 60fps
const replayInterval = setInterval(() => {
  const frame = {
    birdPosition: ghostPositions[currentFrame],
    pipePositions: ghostPipes.filter(pipe => pipe.x > -100),
    flapTimestamps: ghostFlaps.filter(timestamp => timestamp <= currentFrame * 16.67)
  };
  
  onFrame(frame);
  currentFrame++;
}, 16.67);
```

## 📊 Statistics Tracking

The system tracks:
- Total duels played
- Duels won/lost
- Win rate percentage
- Current win streak
- Average score
- Highest score achieved

## 🔮 Future Enhancements

### Planned Features
- **Real-time Duels** - Live head-to-head competition
- **Chat System** - Post-duel messaging
- **Ghost Replay Viewer** - Watch both runs side-by-side
- **Advanced Tournaments** - Bracket-style competitions
- **Custom Challenges** - Set specific rules/conditions

### Technical Improvements
- **WebSocket Integration** - Real-time notifications
- **Advanced Ghost AI** - Machine learning for better ghost runs
- **Cross-platform Sync** - Play on multiple devices
- **Social Features** - Friend lists, achievements

## 🛠️ Development

### Adding New Features

1. **Update Database Schema** - Add new tables/columns
2. **Extend pvpService** - Add new service methods
3. **Create UI Components** - Build new pages/modals
4. **Update Routes** - Add new navigation paths
5. **Test Integration** - Ensure everything works together

### Testing

```bash
# Test PvP functionality
npm run test:pvp

# Test ghost run recording
npm run test:ghost

# Test duel completion
npm run test:duel
```

## 📝 API Reference

### pvpService Methods

```typescript
// Ghost Run Management
await pvpService.createGhostRun(userId, username, score, runData, durationMs);
await pvpService.getGhostRun(runId);
await pvpService.getPublicGhostRuns(limit);

// Duel Management
await pvpService.createDuel(challengerId, challengerUsername, opponentId, opponentUsername, ghostRunId);
await pvpService.acceptDuel(duelId, opponentId);
await pvpService.completeDuel(duelId, opponentScore, opponentRunData, durationMs);

// Tournament Management
await pvpService.getActiveTournaments();
await pvpService.joinTournament(tournamentId, userId, username);

// Statistics
await pvpService.getDuelStats(userId);
```

## 🎯 Best Practices

### For Players
- Practice regularly to improve your ghost runs
- Challenge players of similar skill level
- Participate in tournaments for better rewards
- Use the rematch feature for close battles

### For Developers
- Always validate user input before creating duels
- Implement proper error handling for failed operations
- Use optimistic updates for better UX
- Cache frequently accessed data (tournaments, leaderboards)

## 🐛 Troubleshooting

### Common Issues

**Ghost run not playing correctly**
- Check that run data is properly recorded
- Verify frame rate consistency (60fps)
- Ensure pipe positions are accurate

**Duel not completing**
- Verify both players have completed their runs
- Check database connection and permissions
- Ensure proper error handling in completion logic

**Tournament not updating**
- Check tournament status (upcoming/active/completed)
- Verify participant count updates
- Ensure proper date/time handling

## 📞 Support

For technical support or feature requests:
- **Email**: support@flappypi.fun
- **Discord**: [Flappy Pi Community](https://discord.gg/flappypi)
- **GitHub**: [Report Issues](https://github.com/flappypi/issues)

---

**Happy Dueling! ⚔️🎮** 