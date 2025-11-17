import React, { useState, useEffect } from 'react';

interface NotificationToggleProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'static';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onToggle?: (enabled: boolean) => void;
  initialValue?: boolean;
  storageKey?: string;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  position = 'bottom-left',
  size = 'medium',
  showLabel = true,
  onToggle,
  initialValue = true,
  storageKey = 'gameNotificationsEnabled'
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? JSON.parse(saved) : initialValue;
  });

  // Save notification preference
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notificationsEnabled));
    onToggle?.(notificationsEnabled);
  }, [notificationsEnabled, storageKey, onToggle]);

  // Notification toggle handler
  const handleNotificationToggle = () => {
    setNotificationsEnabled(prev => !prev);
    
    // Show feedback
    const feedback = document.createElement('div');
    feedback.textContent = notificationsEnabled ? '🔕 Notification Cards OFF' : '🔔 Notification Cards ON';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      animation: fadeInOut 2s ease-in-out;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback);
      }
    }, 2000);
  };

  // Position styles
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 1000,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      gap: 8
    };

    // Handle static position for settings modal
    if (position === 'static') {
      return {
        position: 'relative' as const,
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const
      };
    }

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, bottom: 100, right: 20 };
      case 'top-left':
        return { ...baseStyle, top: 100, left: 20 };
      case 'top-right':
        return { ...baseStyle, top: 100, right: 20 };
      default: // bottom-left
        return { ...baseStyle, bottom: 100, left: 20 };
    }
  };

  // Size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, fontSize: 16 };
      case 'large':
        return { width: 60, height: 60, fontSize: 24 };
      default: // medium
        return { width: 50, height: 50, fontSize: 20 };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <div style={getPositionStyle()}>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .notification-enabled {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <button
        onClick={handleNotificationToggle}
        className={notificationsEnabled ? 'notification-enabled' : ''}
        style={{
          ...sizeStyle,
          borderRadius: '50%',
          border: 'none',
          background: notificationsEnabled 
            ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
            : 'linear-gradient(135deg, #9e9e9e, #757575)',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          if (position !== 'static') {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (position !== 'static') {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }
        }}
        title={notificationsEnabled ? 'Turn off notification cards' : 'Turn on notification cards'}
      >
        {notificationsEnabled ? '🔔' : '🔕'}
      </button>
      {showLabel && position !== 'static' && (
        <div style={{
          fontSize: size === 'small' ? 8 : size === 'large' ? 12 : 10,
          color: 'white',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: 10,
          whiteSpace: 'nowrap'
        }}>
          {notificationsEnabled ? 'CARDS ON' : 'CARDS OFF'}
        </div>
      )}
    </div>
  );
};

export default NotificationToggle;