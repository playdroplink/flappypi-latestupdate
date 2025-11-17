import React from 'react';

type WeatherType = 'rain' | 'snow' | 'sunshine' | 'leaves' | 'heatwave' | 'frost' | 'wind' | 'flowers' | 'stars' | 'aurora' | 'clouds' | 'lightning' | 'meteor' | 'fireflies' | 'pollen' | 'hail' | 'alienship';

interface WeatherEffectProps {
  type: WeatherType;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  isNightMode?: boolean;
}

const WeatherEffect: React.FC<WeatherEffectProps> = ({ type, season, isNightMode = false }) => {
  const getWeatherConfig = () => {
    switch (type) {
      case 'rain':
        return { count: 40, className: 'weather rain', speed: '2s' };
      case 'snow':
        return { count: 50, className: 'weather snow', speed: '3s' };
      case 'sunshine':
        return { count: 15, className: 'weather sunshine', speed: '4s' };
      case 'leaves':
        return { count: 25, className: 'weather leaves', speed: '5s' };
      case 'heatwave':
        return { count: 8, className: 'weather heatwave', speed: '6s' };
      case 'frost':
        return { count: 30, className: 'weather frost', speed: '3s' };
      case 'wind':
        return { count: 20, className: 'weather wind', speed: '2s' };
      case 'flowers':
        return { count: 12, className: 'weather flowers', speed: '7s' };
      case 'stars':
        return { count: 60, className: 'weather stars', speed: '8s' };
      case 'aurora':
        return { count: 8, className: 'weather aurora', speed: '10s' };
      case 'clouds':
        return { count: 15, className: 'weather clouds', speed: '12s' };
      case 'lightning':
        return { count: 5, className: 'weather lightning', speed: '4s' };
      case 'meteor':
        return { count: 3, className: 'weather meteor', speed: '6s' };
      case 'fireflies':
        return { count: 20, className: 'weather fireflies', speed: '5s' };
      case 'pollen':
        return { count: 30, className: 'weather pollen', speed: '4s' };
      case 'hail':
        return { count: 25, className: 'weather hail', speed: '2s' };
      case 'alienship':
        return { count: 2, className: 'weather alienship', speed: '15s' };
      default:
        return { count: 30, className: 'weather rain', speed: '2s' };
    }
  };

  const config = getWeatherConfig();

  return (
    <>
      {Array.from({ length: config.count }).map((_, i) => (
        <div
          key={i}
          className={config.className}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: config.speed,
          }}
        />
      ))}
    </>
  );
};

// Enhanced season-based weather selector with night mode support
export const getSeasonalWeather = (isNightMode: boolean = false): WeatherType => {
  const month = new Date().getMonth();
  let season: 'spring' | 'summer' | 'autumn' | 'winter';
  
  // Determine season based on current month
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';

  // Enhanced seasonal weathers with night mode variations
  const seasonalWeathers = {
    spring: {
      day: ['rain', 'flowers', 'wind', 'pollen', 'clouds'] as WeatherType[],
      night: ['stars', 'fireflies', 'wind', 'clouds', 'aurora', 'alienship'] as WeatherType[]
    },
    summer: {
      day: ['sunshine', 'heatwave', 'wind', 'clouds', 'pollen'] as WeatherType[],
      night: ['stars', 'fireflies', 'wind', 'aurora', 'meteor', 'alienship'] as WeatherType[]
    },
    autumn: {
      day: ['leaves', 'rain', 'wind', 'clouds', 'pollen'] as WeatherType[],
      night: ['stars', 'wind', 'clouds', 'aurora', 'fireflies', 'alienship'] as WeatherType[]
    },
    winter: {
      day: ['snow', 'frost', 'wind', 'clouds', 'hail'] as WeatherType[],
      night: ['stars', 'aurora', 'snow', 'frost', 'meteor', 'alienship'] as WeatherType[]
    }
  };

  const timeOfDay = isNightMode ? 'night' : 'day';
  const availableWeathers = seasonalWeathers[season][timeOfDay];
  
  // Add some randomness - 70% chance for seasonal weather, 30% for universal weather
  const useUniversalWeather = Math.random() < 0.3;
  
  if (useUniversalWeather) {
    const universalWeathers = isNightMode 
      ? ['stars', 'aurora', 'clouds', 'meteor', 'alienship'] as WeatherType[]
      : ['rain', 'wind', 'clouds', 'sunshine'] as WeatherType[];
    return universalWeathers[Math.floor(Math.random() * universalWeathers.length)];
  }
  
  return availableWeathers[Math.floor(Math.random() * availableWeathers.length)];
};

// Get weather based on visual mode (light/night)
export const getWeatherByVisualMode = (visualMode: 'light' | 'night'): WeatherType => {
  return getSeasonalWeather(visualMode === 'night');
};

export default WeatherEffect; 