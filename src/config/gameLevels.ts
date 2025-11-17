export const LEVELS = [
  {
    id: "lava-world",
    name: "Lava World",
    background: "/assets/backgrounds/lava_world.png",
    weather: "heat",
    pipeSpeedMultiplier: 1.4,
    flapDelay: 0,
    gravity: 0.28, // Adjusted gravity for faster fall
    jumpStrength: -6, // Adjusted jump strength
    terminalVelocity: 10, // Adjusted terminal velocity
    pipeSpacing: 2500, // Pipes spawn closer
    themeColor: "#D63031",
    description: "Navigate through a scorching landscape with faster pipes and rising heat.",
    effects: "heatwaves", // String identifier for effect
    damageOnContact: true, // New mechanic: minor burn damage
    pipeGapMultiplier: 0.9, // Pipes might be slightly closer
  },
  {
    id: "cave-world",
    name: "Cave World",
    background: "/assets/backgrounds/cave_world.png",
    weather: "dust",
    pipeSpeedMultiplier: 1.2,
    flapDelay: 0,
    gravity: 0.25, // Slightly higher gravity
    jumpStrength: -5.5, // Slightly weaker jump
    terminalVelocity: 9.5,
    pipeSpacing: 2700, // Default pipe spacing
    themeColor: "#8D6E63",
    description: "Explore a dusty cave with low visibility and narrower pipe gaps.",
    effects: "fog",
    lowVisibility: true, // New mechanic: low visibility
    pipeGapMultiplier: 0.8, // Smaller gaps between pipes
  },
  {
    id: "sky-island-world",
    name: "Sky Island World",
    background: "/assets/backgrounds/sky_island.png",
    weather: "clear",
    pipeSpeedMultiplier: 1.0,
    flapDelay: 0,
    gravity: 0.22, // Lighter gravity, floatier jumps
    jumpStrength: -5, // Default jump strength
    terminalVelocity: 9,
    pipeSpacing: 3000, // Normal pipe spacing
    themeColor: "#74B9FF",
    description: "Soar among floating islands in a clear sky. Islands offer brief resting spots.",
    effects: "clouds",
    midairCheckpoints: true, // New mechanic: floating islands as checkpoints
  },
  {
    id: "desert-world",
    name: "Desert World",
    background: "/assets/backgrounds/desert_world.png",
    weather: "duststorm",
    pipeSpeedMultiplier: 1.1,
    flapDelay: 0,
    gravity: 0.26, // Slightly increased gravity
    jumpStrength: -5.8, // Slightly weaker jump
    terminalVelocity: 9.8,
    pipeSpacing: 2800, // Slightly closer pipes
    themeColor: "#FDCB6E",
    description: "Brave the desert dust storms that occasionally push you sideways.",
    effects: "duststorm",
    windPush: true, // New mechanic: wind pushes bird sideways
  },
  {
    id: "ice-world",
    name: "Ice World",
    background: "/assets/backgrounds/ice_world.png",
    weather: "snow",
    pipeSpeedMultiplier: 1.0,
    flapDelay: 0.1, // Significant flap delay
    gravity: 0.24, // Normal gravity
    jumpStrength: -5, // Normal jump strength
    terminalVelocity: 9,
    pipeSpacing: 2900, // Normal pipe spacing
    themeColor: "#AEE6F5",
    description: "Slide through an icy landscape with slippery motion and falling snow.",
    effects: "snowfall",
    slipperyMotion: true, // New mechanic: delayed flap response
  },
  {
    id: "floating-rock-world",
    name: "Floating Rock World",
    background: "/assets/backgrounds/floating_rock.png",
    weather: "wind",
    pipeSpeedMultiplier: 1.3,
    flapDelay: 0,
    gravity: 0.23, // Slightly less gravity for more float
    jumpStrength: -5.2, // Slightly weaker jump
    terminalVelocity: 9.2,
    pipeSpacing: 2600, // Closer pipes due to wind
    themeColor: "#FF9F43",
    description: "Navigate strong winds around floating rocks that shift your flight path.",
    effects: "wind",
    randomVerticalShift: true, // New mechanic: wind randomly shifts bird up/down
  },
];

export type GameLevel = typeof LEVELS[0]; 