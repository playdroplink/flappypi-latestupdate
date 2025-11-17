import React, { useEffect } from 'react';

interface MandatoryAdModalProps {
  onClose: () => void;
}

const MandatoryAdModal: React.FC<MandatoryAdModalProps> = ({ onClose }) => {
  useEffect(() => {
    // Simulate ad duration (e.g., 5 seconds)
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-600">Ad Break</h2>
        <p className="mb-6 text-gray-700">This ad is required to keep Flappy Pi free for everyone.<br/>Thank you for your support!</p>
        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          {/* Placeholder for Pi Ad Network ad */}
          <span className="text-gray-500">[Ad Playing...]</span>
        </div>
        <p className="text-sm text-gray-500">Ad will close automatically.</p>
      </div>
    </div>
  );
};

export default MandatoryAdModal; 