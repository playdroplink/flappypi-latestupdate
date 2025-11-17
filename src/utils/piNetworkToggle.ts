// Pi Network Mode Toggle Utility
// This utility helps switch between testnet and mainnet modes for testing

export const PiNetworkToggle = {
  // Enable testnet mode
  enableTestnet(): void {
    localStorage.setItem('flappypi-testnet-mode', 'true');
    console.log('🧪 Testnet mode enabled. Please refresh the page.');
    this.showNotification('Testnet mode enabled. Please refresh the page.');
  },

  // Disable testnet mode (use mainnet)
  disableTestnet(): void {
    localStorage.removeItem('flappypi-testnet-mode');
    console.log('🚀 Mainnet mode enabled. Please refresh the page.');
    this.showNotification('Mainnet mode enabled. Please refresh the page.');
  },

  // Check current mode
  isTestnetMode(): boolean {
    return localStorage.getItem('flappypi-testnet-mode') === 'true';
  },

  // Get current network mode
  getCurrentMode(): 'testnet' | 'mainnet' {
    return this.isTestnetMode() ? 'testnet' : 'mainnet';
  },

  // Toggle between modes
  toggleMode(): void {
    if (this.isTestnetMode()) {
      this.disableTestnet();
    } else {
      this.enableTestnet();
    }
  },

  // Show notification
  showNotification(message: string): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  },

  // Add toggle button to page (for development)
  addToggleButton(): void {
    if (typeof window === 'undefined') return;

    // Check if button already exists
    if (document.getElementById('pi-network-toggle')) return;

    const button = document.createElement('button');
    button.id = 'pi-network-toggle';
    button.textContent = `Switch to ${this.isTestnetMode() ? 'Mainnet' : 'Testnet'}`;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    button.addEventListener('click', () => {
      this.toggleMode();
      // Update button text
      button.textContent = `Switch to ${this.isTestnetMode() ? 'Mainnet' : 'Testnet'}`;
    });

    document.body.appendChild(button);
  },

  // Remove toggle button
  removeToggleButton(): void {
    const button = document.getElementById('pi-network-toggle');
    if (button && button.parentNode) {
      button.parentNode.removeChild(button);
    }
  }
};

// Auto-add toggle button in development mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Add button after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PiNetworkToggle.addToggleButton();
    });
  } else {
    PiNetworkToggle.addToggleButton();
  }
}

export default PiNetworkToggle;
