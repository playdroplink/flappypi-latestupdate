# TruthWeb AI - Flappy Pi Support Chatbot

## 🚀 Overview

TruthWeb AI is an intelligent support chatbot for Flappy Pi, powered by OpenRouter's Sonoma models. It provides real-time assistance to players with game-related questions, Pi Network integration help, and technical support.

## ✨ Features

### 🎨 Enhanced Design
- **Modern UI**: Beautiful gradient design with indigo, purple, and pink themes
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Professional Branding**: TruthWeb AI identity throughout the interface

### 🤖 AI Capabilities
- **Sonoma Models**: Uses `openrouter/sonoma-dusk-alpha` for intelligent responses
- **Context-Aware**: Understands Flappy Pi game mechanics and Pi Network integration
- **Fallback Responses**: Always provides helpful information even when offline
- **Quick Questions**: Pre-built responses for common queries

### 💬 Chat Features
- **Real-time Chat**: Instant responses with typing indicators
- **Message History**: Persistent conversation flow
- **Quick Actions**: Click-to-ask common questions
- **Error Handling**: Graceful fallbacks for connection issues

## 🛠️ Technical Setup

### Environment Variables
```bash
VITE_OPENROUTER_API_KEY="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"
```

### API Configuration
- **Model**: `openrouter/sonoma-dusk-alpha`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Max Tokens**: 500
- **Temperature**: 0.7
- **Top P**: 0.9

## 🎯 Usage

### Accessing the Chatbot
1. **Floating Button**: Click the "TruthWeb AI" button in the bottom-right corner
2. **Home Page**: Available on the main home page
3. **Global Access**: Integrated throughout the Flappy Pi application

### Quick Questions Available
- "How do I play Flappy Pi?"
- "How to earn Flappy Coins?"
- "Pi Network integration help"
- "Game controls and tips"
- "Account and login issues"

### Custom Questions
Users can ask any question about:
- Game mechanics and controls
- Earning and spending Flappy Coins
- Pi Network wallet integration
- Power-ups and game items
- Leaderboards and achievements
- Technical troubleshooting
- Account and payment issues

## 🔧 Components

### Core Files
- `src/components/FlappyPiChatbot.tsx` - Main chatbot component
- `src/components/ChatbotButton.tsx` - Floating action button
- `src/services/chatbotService.ts` - API integration service

### Key Features
- **Error Handling**: Graceful fallbacks for API failures
- **TypeScript**: Full type safety and IntelliSense support
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (600-500)
- **Secondary**: Purple (600-500)
- **Accent**: Pink (600-500)
- **Background**: Gradient from slate-50 to indigo-100
- **Text**: Gray scale with proper contrast

### Typography
- **Headers**: Bold, 2xl size
- **Body**: Medium weight, readable sizes
- **Captions**: Small, muted colors

### Animations
- **Hover Effects**: Scale and shadow transitions
- **Loading States**: Bouncing dots with color progression
- **Button Interactions**: Smooth color and size changes

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   node setup-chatbot-env.js
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Test the Chatbot**:
   - Navigate to the home page
   - Click the "TruthWeb AI" floating button
   - Start chatting!

## 🧪 Testing

### Python Test Script
```bash
python test-truthweb-ai.py
```

This script tests:
- Sonoma Dusk Alpha model responses
- Sonoma Sky Alpha model responses
- Image analysis capabilities
- API connectivity

### Manual Testing
1. **Quick Questions**: Test all pre-built responses
2. **Custom Questions**: Ask various game-related questions
3. **Error Handling**: Test offline scenarios
4. **Mobile Responsiveness**: Test on different screen sizes

## 🔒 Security

- **API Key**: Stored in environment variables
- **CORS**: Properly configured for OpenRouter
- **Input Validation**: Sanitized user inputs
- **Error Handling**: No sensitive data in error messages

## 📱 Mobile Support

- **Touch-Friendly**: Large tap targets
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Scrolling**: Optimized for mobile devices
- **Keyboard Support**: Proper input handling

## 🎉 Success Metrics

- ✅ **Enhanced Design**: Modern, professional appearance
- ✅ **TruthWeb AI Branding**: Consistent identity throughout
- ✅ **OpenRouter Integration**: Working API with Sonoma models
- ✅ **Error Handling**: Graceful fallbacks for all scenarios
- ✅ **Mobile Responsive**: Perfect on all devices
- ✅ **TypeScript Support**: Full type safety
- ✅ **Accessibility**: WCAG compliant

## 🚀 Future Enhancements

- **Voice Input**: Speech-to-text capabilities
- **Multi-language**: Support for different languages
- **Analytics**: Usage tracking and insights
- **Custom Models**: Fine-tuned Flappy Pi specific model
- **Integration**: Connect with game state and user data

---

**TruthWeb AI** - Your intelligent Flappy Pi support assistant! 🐦✨
