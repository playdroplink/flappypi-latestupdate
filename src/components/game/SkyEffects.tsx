import React from 'react';

function getSkyState() {
  const hour = new Date().getHours();
  const month = new Date().getMonth();
  let period = 'morning';
  if (hour >= 5 && hour < 11) period = 'morning';
  else if (hour >= 11 && hour < 17) period = 'afternoon';
  else if (hour >= 17 && hour < 20) period = 'evening';
  else period = 'night';

  const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  const season = seasons[month];

  return { period, season };
}

const SkyEffects = () => {
  const { period, season } = getSkyState();

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {/* Sun/Moon */}
      {period !== 'night' ? (
        <div className="sky-sun" />
      ) : (
        <>
          <div className="sky-moon" />
          {[...Array(30)].map((_, i) => (
            <div key={i} className="sky-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`
            }} />
          ))}
        </>
      )}
      {/* Clouds */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`sky-cloud sky-cloud-${i}`} />
      ))}
      {/* Weather overlays */}
      {season === 'winter' && <div className="sky-snow" />}
      {season === 'spring' && period === 'afternoon' && <div className="sky-rain" />}
      {season === 'autumn' && period === 'evening' && <div className="sky-storm" />}
    </div>
  );
};

export default SkyEffects; 