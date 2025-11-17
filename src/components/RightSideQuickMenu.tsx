import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface QuickMenuLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface RightSideQuickMenuProps {
  links: QuickMenuLink[];
  navIcons?: React.ReactNode[];
  buttonIcon?: React.ReactNode;
  buttonLabel?: string;
  style?: React.CSSProperties;
}

const RightSideQuickMenu: React.FC<RightSideQuickMenuProps> = ({
  links,
  navIcons = [],
  buttonIcon,
  buttonLabel = 'Quick Navigation',
  style = {},
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          zIndex: 15000,
          background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
          border: 'none',
          borderRadius: '12px 0 0 12px',
          padding: '16px 8px',
          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          ...style,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
        aria-label={buttonLabel}
      >
        {buttonIcon || <span style={{ color: 'white', fontSize: 24 }}>☰</span>}
      </button>
      {/* Overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(60,0,100,0.18)',
            zIndex: 14999,
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setOpen(false)}
        />
      )}
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : -340,
          width: 320,
          height: '100vh',
          background: 'linear-gradient(135deg, #f4f3ff 0%, #ede9fe 100%)',
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          boxShadow: open ? '-4px 0 32px rgba(147, 51, 234, 0.3)' : '-4px 0 24px #a78bfa33',
          zIndex: 15001,
          padding: '32px 24px 24px 24px',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          opacity: open ? 1 : 0.8,
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            marginBottom: 16,
            padding: 8,
            borderRadius: 8,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          aria-label="Close navigation menu"
        >
          <X size={28} color="#9333ea" />
        </button>
        <h2 style={{ color: '#9333ea', fontWeight: 700, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>{buttonLabel}</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link, i) => (
            <li
              key={link.href}
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 12,
                padding: '8px 12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateX(0)',
                animation: open ? `slideInRight 0.3s ease-out ${i * 0.05}s both` : 'none',
              }}
              onClick={() => setOpen(false)}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ede9fe';
                e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
              }}
            >
              <span style={{ marginRight: 12, transition: 'transform 0.2s ease' }}>{link.icon || navIcons[i % navIcons.length]}</span>
              <a
                href={link.href}
                style={{
                  color: '#2563eb',
                  fontWeight: 500,
                  fontSize: 18,
                  textDecoration: 'none',
                  flex: 1,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#9333ea'}
                onMouseLeave={e => e.currentTarget.style.color = '#2563eb'}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default RightSideQuickMenu; 