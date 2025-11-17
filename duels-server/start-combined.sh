#!/bin/bash

echo "🎮 Starting Combined Duels + Leaderboard Server..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if config file exists
if [ ! -f "config.js" ]; then
    echo "❌ config.js not found"
    echo "Please run setup-duels-server.sh first"
    exit 1
fi

# Start the combined server
echo "🚀 Starting server..."
echo
echo "📡 Combined Duels + Leaderboard Server"
echo "🎮 Real-time multiplayer duels"
echo "🏆 Real-time leaderboard updates"
echo
echo "Press Ctrl+C to stop the server"
echo

node server-combined.js
