import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActionButtons from '../QuickActionButtons';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock the language context
const mockLanguageContext = {
  t: (key: string) => key, // Return the key as-is for testing
  currentLanguage: 'en',
  setLanguage: jest.fn(),
  supportedLanguages: [],
  userCountry: 'US',
  detectedLanguage: 'en',
  refreshTrigger: 0
};

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
  ...jest.requireActual('@/context/LanguageContext'),
  useLanguage: () => mockLanguageContext
}));

describe('QuickActionButtons', () => {
  const defaultProps = {
    onOpenShop: jest.fn(),
    onOpenLeaderboard: jest.fn(),
    onOpenTutorial: jest.fn(),
    onOpenCommunity: jest.fn(),
    onOpenDailyRewards: jest.fn(),
    onOpenSubscription: jest.fn(),
    onOpenSettings: jest.fn(),
    onOpenHelp: jest.fn(),
    onOpenChat: jest.fn(),
    onOpenEvents: jest.fn(),
    onOpenSpecial: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with basic props', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByText('quickActions')).toBeInTheDocument();
      expect(screen.getByText('quickActionsDescription')).toBeInTheDocument();
    });

    it('renders primary action buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByLabelText('shop')).toBeInTheDocument();
      expect(screen.getByLabelText('leaderboard')).toBeInTheDocument();
    });

    it('renders secondary action buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByLabelText('dailyRewards')).toBeInTheDocument();
      expect(screen.getByLabelText('tutorial')).toBeInTheDocument();
      expect(screen.getByLabelText('community')).toBeInTheDocument();
    });

    it('renders premium action buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByLabelText('premium')).toBeInTheDocument();
      expect(screen.getByLabelText('special')).toBeInTheDocument();
    });

    it('renders utility buttons when handlers are provided', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByLabelText('settings')).toBeInTheDocument();
      expect(screen.getByLabelText('help')).toBeInTheDocument();
    });

    it('does not render utility buttons when handlers are not provided', () => {
      const propsWithoutUtility = {
        onOpenShop: jest.fn(),
        onOpenLeaderboard: jest.fn()
      };
      
      render(<QuickActionButtons {...propsWithoutUtility} />);
      
      expect(screen.queryByLabelText('settings')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('help')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onOpenShop when shop button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('shop'));
      expect(defaultProps.onOpenShop).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenLeaderboard when leaderboard button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('leaderboard'));
      expect(defaultProps.onOpenLeaderboard).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenDailyRewards when daily rewards button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('dailyRewards'));
      expect(defaultProps.onOpenDailyRewards).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenTutorial when tutorial button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('tutorial'));
      expect(defaultProps.onOpenTutorial).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenCommunity when community button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('community'));
      expect(defaultProps.onOpenCommunity).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenSubscription when premium button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('premium'));
      expect(defaultProps.onOpenSubscription).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenSpecial when special button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('special'));
      expect(defaultProps.onOpenSpecial).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenSettings when settings button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('settings'));
      expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenHelp when help button is clicked', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('help'));
      expect(defaultProps.onOpenHelp).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('title');
      });
    });

    it('has proper focus management', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const firstButton = screen.getByLabelText('shop');
      firstButton.focus();
      
      expect(firstButton).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes to primary buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const shopButton = screen.getByLabelText('shop');
      expect(shopButton).toHaveClass('h-14', 'sm:h-16', 'text-base');
    });

    it('applies correct CSS classes to secondary buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const tutorialButton = screen.getByLabelText('tutorial');
      expect(tutorialButton).toHaveClass('h-12', 'text-sm');
    });

    it('applies correct CSS classes to utility buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const settingsButton = screen.getByLabelText('settings');
      expect(settingsButton).toHaveClass('h-10', 'text-xs');
    });

    it('applies gradient classes to buttons', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      const shopButton = screen.getByLabelText('shop');
      expect(shopButton).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('Internationalization', () => {
    it('uses translation function for button labels', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      // The mock returns the key as-is, so we can verify the translation function is called
      expect(screen.getByText('shop')).toBeInTheDocument();
      expect(screen.getByText('leaderboard')).toBeInTheDocument();
    });

    it('uses translation function for section title and description', () => {
      render(<QuickActionButtons {...defaultProps} />);
      
      expect(screen.getByText('quickActions')).toBeInTheDocument();
      expect(screen.getByText('quickActionsDescription')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render utility buttons when not needed', () => {
      const { rerender } = render(<QuickActionButtons {...defaultProps} />);
      
      // Should render utility buttons
      expect(screen.getByLabelText('settings')).toBeInTheDocument();
      
      // Re-render without utility handlers
      rerender(<QuickActionButtons onOpenShop={jest.fn()} onOpenLeaderboard={jest.fn()} />);
      
      // Should not render utility buttons
      expect(screen.queryByLabelText('settings')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing handlers gracefully', () => {
      const propsWithMissingHandlers = {
        onOpenShop: jest.fn(),
        onOpenLeaderboard: jest.fn(),
        // Missing other handlers
      };
      
      expect(() => {
        render(<QuickActionButtons {...propsWithMissingHandlers} />);
      }).not.toThrow();
    });

    it('renders only available buttons when some handlers are missing', () => {
      const propsWithMissingHandlers = {
        onOpenShop: jest.fn(),
        onOpenLeaderboard: jest.fn(),
        // Missing other handlers
      };
      
      render(<QuickActionButtons {...propsWithMissingHandlers} />);
      
      // Should render primary buttons
      expect(screen.getByLabelText('shop')).toBeInTheDocument();
      expect(screen.getByLabelText('leaderboard')).toBeInTheDocument();
      
      // Should not render secondary buttons
      expect(screen.queryByLabelText('dailyRewards')).not.toBeInTheDocument();
    });
  });
}); 