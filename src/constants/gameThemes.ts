export const themes = {
  // Basic themes
  day: "bg-gradient-to-b from-sky-400 via-blue-300 to-cyan-300",
  sunset: "bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500",
  evening: "bg-gradient-to-b from-orange-400 via-pink-500 to-purple-700",
  night: "bg-gradient-to-b from-blue-900 via-indigo-800 to-gray-900",
  
  // Seasonal themes
  spring: "bg-gradient-to-b from-green-200 via-green-400 to-emerald-600",
  summer: "bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-500",
  autumn: "bg-gradient-to-b from-orange-200 via-red-400 to-amber-600",
  winter: "bg-gradient-to-b from-blue-200 via-cyan-400 to-blue-600",
  
  // Weather themes
  rain: "bg-gradient-to-b from-gray-400 via-blue-500 to-slate-600",
  storm: "bg-gradient-to-b from-gray-700 via-slate-600 to-zinc-800",
  foggy: "bg-gradient-to-b from-gray-300 via-slate-400 to-gray-500",
  
  // Fantasy themes
  space: "bg-gradient-to-b from-gray-900 via-purple-900 to-black",
  nebula: "bg-gradient-to-b from-purple-900 via-pink-700 to-indigo-900",
  galaxy: "bg-gradient-to-b from-indigo-900 via-purple-800 to-blue-900",
  
  // Environment themes
  desert: "bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600",
  ocean: "bg-gradient-to-b from-cyan-200 via-blue-400 to-blue-800",
  forest: "bg-gradient-to-b from-emerald-300 via-green-500 to-green-800",
  mountains: "bg-gradient-to-b from-slate-300 via-stone-500 to-gray-700",
  
  // Special themes
  rainbow: "bg-gradient-to-b from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400",
  aurora: "bg-gradient-to-b from-green-400 via-teal-500 to-purple-600",
  volcanic: "bg-gradient-to-b from-red-600 via-orange-700 to-yellow-800",
  arctic: "bg-gradient-to-b from-cyan-100 via-blue-200 to-indigo-400",
  
  // Time-based themes
  dawn: "bg-gradient-to-b from-pink-300 via-orange-300 to-yellow-400",
  dusk: "bg-gradient-to-b from-purple-400 via-indigo-500 to-blue-800",
  midnight: "bg-gradient-to-b from-gray-900 via-blue-900 to-black",
  
  // Game mode specific themes
  classic: "bg-gradient-to-b from-sky-400 to-cyan-300",
  endless: "bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500",
  challenge: "bg-gradient-to-b from-red-500 via-orange-600 to-yellow-600"
};

// Theme progression based on level
export const levelThemes = {
  1: 'day',
  5: 'sunset',
  10: 'night',
  15: 'evening',
  20: 'winter',
  25: 'storm',
  30: 'space',
  35: 'nebula',
  40: 'galaxy',
  45: 'desert',
  50: 'ocean',
  55: 'forest',
  60: 'mountains',
  65: 'rainbow',
  70: 'aurora',
  75: 'volcanic',
  80: 'arctic',
  85: 'dawn',
  90: 'dusk',
  95: 'midnight'
};

// Get theme for specific level
export const getThemeForLevel = (level: number): keyof typeof themes => {
  // Safety check for invalid level values
  if (typeof level !== 'number' || isNaN(level) || level < 1) {
    return 'day'; // default theme
  }
  
  const thresholds = Object.keys(levelThemes).map(Number).sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (level >= threshold) {
      const themeKey = levelThemes[threshold as keyof typeof levelThemes];
      // Ensure the theme exists in our themes object
      if (themeKey && themes[themeKey as keyof typeof themes]) {
        return themeKey as keyof typeof themes;
      }
    }
  }
  
  return 'day'; // default theme
};

// Theme descriptions for notifications
export const themeDescriptions = {
  day: "A bright, cheerful sky perfect for flying!",
  sunset: "Golden hour with warm, beautiful colors!",
  evening: "Romantic evening skies with stunning hues!",
  night: "Dark skies filled with mystery and challenge!",
  spring: "Fresh green landscapes full of life!",
  summer: "Warm, sunny weather perfect for adventure!",
  autumn: "Beautiful fall colors and crisp air!",
  winter: "Cool, serene winter wonderland!",
  rain: "Stormy weather adds extra challenge!",
  storm: "Lightning and thunder create intensity!",
  foggy: "Mysterious fog reduces visibility!",
  space: "Journey through the vast cosmos!",
  nebula: "Fly through colorful cosmic clouds!",
  galaxy: "Navigate the star-filled galaxy!",
  desert: "Hot, sandy landscapes await!",
  ocean: "Deep blue waters stretch endlessly!",
  forest: "Lush green canopies provide cover!",
  mountains: "Majestic peaks challenge your skills!",
  rainbow: "Magical rainbow colors everywhere!",
  aurora: "Northern lights dance around you!",
  volcanic: "Fiery landscapes test your courage!",
  arctic: "Icy cold environments await!",
  dawn: "Early morning light guides your way!",
  dusk: "Twilight brings peaceful serenity!",
  midnight: "The darkest hour tests your vision!"
};

export type Theme = keyof typeof themes; 