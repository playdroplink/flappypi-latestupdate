

# Flappy Pi - Pi Network Game

A fun and engaging Flappy Bird-style game built for the Pi Network ecosystem, featuring Pi cryptocurrency integration, NFT skins, and a comprehensive gaming experience.

## 🎮 Features

### Core Gameplay
- **Multiple Game Modes**: Classic, Endless, Challenge, and Time Attack modes
- **Progressive Difficulty**: Dynamic pipe gaps and speeds based on score
- **Power-ups System**: Shield, magnet, turbo start, and coin multiplier
- **Coin Collection**: Earn Flappy Coins during gameplay
- **Skin System**: Unlock and equip different bird skins
- **Level Progression**: Unlock new themes and challenges as you progress

### Pi Network Integration
- **Pi Authentication**: Seamless login with Pi Network accounts
- **Pi Payments**: Purchase skins, power-ups, and bundles with Pi cryptocurrency
- **Wallet Integration**: Manage Pi and Flappy Coins in-game
- **Pi Browser Support**: Optimized for Pi Browser experience

### Social Features
- **Leaderboards**: Compete with other players globally
- **Friend System**: Invite friends and play together
- **Achievement System**: Unlock achievements and rewards
- **Daily Rewards**: Login daily for bonus coins

### Technical Features
- **Responsive Design**: Optimized for all device sizes with responsive grid layout
- **Cross-Platform**: Works on mobile, tablet, and desktop
- **Touch Optimized**: Smooth touch controls for mobile devices
- **Performance Optimized**: 60 FPS gameplay with hardware acceleration
- **Offline Support**: Core gameplay works without internet connection

## 🎯 Game Modes

### Classic Mode
- Traditional Flappy Bird gameplay
- Progressive difficulty scaling
- Theme changes every 5 levels
- Seasonal weather effects

### Endless Mode
- Infinite gameplay with increasing challenge
- Special power-up combinations
- Unique visual effects
- High score tracking

### Challenge Mode
- Time-limited challenges
- Special objectives and goals
- Unique rewards and achievements
- Competitive leaderboards

## 🛍️ Shop System

### Available Items
- **Character Skins**: Unlock unique bird appearances
- **Power-ups**: Temporary gameplay enhancements
- **Mystery Boxes**: Random item rewards
- **Bundles**: Value packages with multiple items
- **Subscription Plans**: Premium features and benefits

### Payment Methods
- **Pi Cryptocurrency**: Primary payment method
- **Flappy Coins**: In-game currency earned through gameplay
- **Subscription Plans**: Monthly and annual premium memberships

## ⚙️ Settings & Customization

### Audio Settings
- **Sound Effects**: Toggle game sound effects
- **Background Music**: Enable/disable background music
- **Volume Control**: Adjust audio levels

### Notification Settings
- **Notification Cards**: Toggle visual notification cards during gameplay
- **Settings Modal**: Access notification controls through the settings menu
- **Persistent Preferences**: Settings saved across sessions

### Game Settings
- **Difficulty Adjustment**: Customize game challenge level
- **Visual Effects**: Toggle particle effects and animations
- **Performance Mode**: Optimize for lower-end devices

## 📱 Responsive Grid System

The app features a comprehensive responsive grid layout system that ensures optimal organization across all devices:

### Components
- **ResponsiveGrid**: Auto-fitting grid layouts
- **ResponsiveContainer**: Centered content containers
- **ResponsiveGameContainer**: Full viewport game wrappers
- **ResponsiveGameArea**: Optimized game canvas with touch handling
- **ResponsiveUIGrid**: Configurable UI grids
- **ResponsiveButtonGrid**: Auto-fitting button layouts
- **ResponsiveFooterGrid**: Fixed footer with blur effects

### Breakpoints
- **Mobile (320px-575px)**: Full viewport, 2-column UI, single column buttons
- **Small Tablets (576px-767px)**: 4-column UI, 2-column buttons
- **Tablets (768px-991px)**: 90% viewport, 3-column buttons
- **Desktop (992px+)**: Fixed 480px game area, 5-column buttons
- **Large Desktop (1200px+)**: 1200px max container, auto-fit grids

### Features
- **Touch Optimization**: 44px minimum touch targets
- **Accessibility**: High contrast, reduced motion, keyboard navigation
- **Performance**: Hardware acceleration, high DPI optimization
- **Orientation Support**: Landscape adjustments, dynamic heights

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Pi Network account (optional for full features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flappy-pi.git
   cd flappy-pi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── game/           # Game-specific components
│   ├── ui/            # Reusable UI components
│   └── home/          # Home page components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── styles/            # CSS and styling
└── context/           # React context providers
```

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_PI_APP_ID=your_pi_app_id
REACT_APP_PI_API_KEY=your_pi_api-key
REACT_APP_BACKEND_URL=your_backend_url
```

### Pi Network Setup
1. Create a Pi App in the Pi Developer Portal
2. Configure authentication settings
3. Set up payment integration
4. Test with Pi Testnet

## 🎨 Customization

### Themes
- Modify `src/constants/gameModes.ts` for theme changes
- Update `src/styles/` for visual customization
- Customize colors in `src/constants/colors.ts`

### Game Mechanics
- Adjust difficulty in `src/utils/difficultySystem.ts`
- Modify power-ups in `src/constants/powerUps.ts`
- Update scoring in `src/utils/scoringSystem.ts`

## 📊 Analytics & Monitoring

### Game Analytics
- Player behavior tracking
- Performance metrics
- Error monitoring
- User engagement analytics

### Pi Network Analytics
- Payment success rates
- Authentication metrics
- User conversion tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use responsive design principles
- Maintain accessibility standards
- Test across multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Pi Network team for blockchain integration
- Flappy Bird creators for game inspiration
- React and TypeScript communities
- Open source contributors

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/flappy-pi/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/flappy-pi/issues)
- **Discord**: [Community Server](https://discord.gg/flappypi)
- **Email**: support@flappypi.com

---

**Made with ❤️ for the Pi Network community**

## Flappy Coins Notice

- Flappy Coins are in-game currency only.
- They cannot be converted to Pi or any other real-world value.
- Flappy Coins are for in-game use (purchases, upgrades, etc.) only.
- Only Pi will be rewarded to users in the future for certain achievements or events.



