# Countdown Visibility Fixes

## Problem
The countdown numbers (3, 2, 1) were not visible enough due to:
- White text with white glow on light backgrounds
- Insufficient contrast
- Weak text shadows
- Subtle animation that didn't make the numbers stand out

## Solution
Enhanced the countdown styling in `src/components/game/ClassicMode.tsx`:

### 1. Enhanced Countdown Number Styling
- **Color**: Changed from white to bright gold (`#FFD700`)
- **Font Weight**: Increased from `bold` to `900` for maximum visibility
- **Text Shadow**: Added multiple layers of gold glow effects (10px to 100px)
- **Background**: Added radial gradient background with gold tint
- **Filters**: Applied brightness(1.5) and contrast(1.2) for enhanced visibility
- **Border Radius**: Added circular background with padding

### 2. Enhanced Countdown Text Styling
- **Color**: Changed to bright gold (`#FFD700`)
- **Font Size**: Increased from 1.25rem to 1.5rem
- **Font Weight**: Increased from 600 to 700
- **Background**: Added semi-transparent black background
- **Border**: Added gold border for better definition
- **Text Shadow**: Multiple layers of gold glow and black shadow

### 3. Enhanced Countdown Animation
- **Pulse Effect**: More dramatic scaling (0.8 to 1.15)
- **Brightness**: Dynamic brightness changes during animation
- **Contrast**: Enhanced contrast during peak animation
- **Opacity**: Better opacity management for visibility

### 4. Enhanced Container Background
- **Radial Gradient**: Added dark radial gradient background
- **Backdrop Filter**: Added subtle blur effect
- **Layering**: Ensures countdown appears above all game elements

## Technical Details

### CSS Changes Applied:
```css
.countdown-number {
  font-size: 8rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 
    0 0 10px #FFD700,
    0 0 20px #FFD700,
    /* ... multiple glow layers ... */
    2px 2px 4px rgba(0,0,0,0.8);
  background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 70%, transparent 100%);
  border-radius: 50%;
  padding: 2rem;
  filter: brightness(1.5) contrast(1.2);
}

.countdown-text {
  font-size: 1.5rem;
  color: #FFD700;
  text-shadow: /* multiple glow and shadow layers */;
  background: rgba(0,0,0,0.6);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: 2px solid #FFD700;
}

@keyframes countdownPulse {
  0% { transform: scale(0.8); opacity: 0.7; filter: brightness(1) contrast(1); }
  25% { transform: scale(1.1); opacity: 1; filter: brightness(1.8) contrast(1.3); }
  50% { transform: scale(1.05); opacity: 1; filter: brightness(1.5) contrast(1.2); }
  75% { transform: scale(1.15); opacity: 1; filter: brightness(1.8) contrast(1.3); }
  100% { transform: scale(1); opacity: 1; filter: brightness(1.5) contrast(1.2); }
}
```

## Result
- Countdown numbers are now highly visible with bright gold color
- Strong contrast against any background
- Dramatic pulsing animation that draws attention
- Professional appearance with proper layering and effects
- Numbers are clearly readable on all devices and screen sizes

## Files Modified
- `src/components/game/ClassicMode.tsx` - Enhanced countdown CSS styling
