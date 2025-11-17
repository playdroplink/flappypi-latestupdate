import React, { useEffect } from 'react';

interface RemoveHeaderSpaceProps {
  isGameActive: boolean;
}

const RemoveHeaderSpace: React.FC<RemoveHeaderSpaceProps> = ({ isGameActive }) => {
  useEffect(() => {
    if (!isGameActive) return;

    // Aggressive header removal
    const removeHeaders = () => {
      // Remove all possible header elements
      const headerSelectors = [
        '.header',
        '[class*="header"]',
        'nav',
        '[class*="navigation"]',
        '[class*="navbar"]',
        '[class*="top-bar"]',
        '[class*="app-bar"]',
        'header',
        '[role="banner"]',
        '.fixed.top-0',
        '[class*="fixed"][class*="top"]'
      ];

      headerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.display = 'none';
          (element as HTMLElement).style.visibility = 'hidden';
          (element as HTMLElement).style.height = '0';
          (element as HTMLElement).style.overflow = 'hidden';
        });
      });

      // Remove body padding and margins
      document.body.style.paddingTop = '0';
      document.body.style.marginTop = '0';
      document.body.style.padding = '0';
      document.body.style.margin = '0';

      // Remove html padding and margins
      document.documentElement.style.paddingTop = '0';
      document.documentElement.style.marginTop = '0';
      document.documentElement.style.padding = '0';
      document.documentElement.style.margin = '0';

      // Add aggressive fullscreen class
      document.body.classList.add('aggressive-fullscreen');

      // Hide any fixed positioned elements at the top
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      fixedElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < 100) { // If element is near the top
          (element as HTMLElement).style.display = 'none';
        }
      });
    };

    // Restore headers
    const restoreHeaders = () => {
      const headerSelectors = [
        '.header',
        '[class*="header"]',
        'nav',
        '[class*="navigation"]',
        '[class*="navbar"]',
        '[class*="top-bar"]',
        '[class*="app-bar"]',
        'header',
        '[role="banner"]',
        '.fixed.top-0',
        '[class*="fixed"][class*="top"]'
      ];

      headerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.display = '';
          (element as HTMLElement).style.visibility = '';
          (element as HTMLElement).style.height = '';
          (element as HTMLElement).style.overflow = '';
        });
      });

      // Restore body styles
      document.body.style.paddingTop = '';
      document.body.style.marginTop = '';
      document.body.style.padding = '';
      document.body.style.margin = '';

      // Restore html styles
      document.documentElement.style.paddingTop = '';
      document.documentElement.style.marginTop = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.margin = '';

      // Remove aggressive fullscreen class
      document.body.classList.remove('aggressive-fullscreen');
    };

    if (isGameActive) {
      removeHeaders();
    } else {
      restoreHeaders();
    }

    // Cleanup on unmount
    return () => {
      restoreHeaders();
    };
  }, [isGameActive]);

  return null; // This component doesn't render anything
};

export default RemoveHeaderSpace;
