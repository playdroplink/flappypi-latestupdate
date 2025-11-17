import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Responsive Grid Component
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`responsive-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '', 
  style = {},
  maxWidth = '100%'
}) => {
  return (
    <div 
      className={`responsive-container ${className}`}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '0 1rem',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Responsive Game Container Component
interface ResponsiveGameContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveGameContainer: React.FC<ResponsiveGameContainerProps> = ({ 
  children, 
  className = '', 
  style = {}
}) => {
  return (
    <div 
      className={`responsive-game-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '100vw',
        margin: '0',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Responsive Game Area Component
interface ResponsiveGameAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onTouchStart?: () => void;
}

const ResponsiveGameArea: React.FC<ResponsiveGameAreaProps> = ({ 
  children, 
  className = '', 
  style = {},
  onClick,
  onTouchStart
}) => {
  const isMobile = window.innerWidth <= 768;
  
  return (
    <div 
      className={`responsive-game-area ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        margin: '0 auto',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        maxWidth: '100vw',
        maxHeight: '100vh',
        minHeight: '100vh',
        paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : '0px',
        paddingBottom: isMobile ? '60px' : '0px',
        ...style
      }}
      onClick={onClick}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
};

// Responsive UI Grid Component
interface ResponsiveUIGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  columns?: number;
}

const ResponsiveUIGrid: React.FC<ResponsiveUIGridProps> = ({ 
  children, 
  className = '', 
  style = {},
  columns = 4
}) => {
  return (
    <div 
      className={`responsive-ui-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.5rem',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0.5rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Responsive Button Grid Component
interface ResponsiveButtonGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveButtonGrid: React.FC<ResponsiveButtonGridProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`responsive-button-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '0.5rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Responsive Footer Grid Component
interface ResponsiveFooterGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveFooterGrid: React.FC<ResponsiveFooterGridProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`responsive-footer-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '0.5rem',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '0.5rem',
        position: 'fixed',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem 1rem 0 0',
        zIndex: 1000,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export {
  ResponsiveGrid,
  ResponsiveContainer,
  ResponsiveGameContainer,
  ResponsiveGameArea,
  ResponsiveUIGrid,
  ResponsiveButtonGrid,
  ResponsiveFooterGrid
}; 