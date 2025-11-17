import React from 'react';

interface PaymentButtonProps {
  type: 'pi' | 'coins';
  price: string | number;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  itemImage?: string;
  useInDialog?: boolean;
}

const baseClass =
  'w-full py-3 text-lg font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-200';

const piClass =
  'bg-[#A259FF] hover:bg-[#8B3DFF] text-white';
const coinsClass =
  'bg-[#FFD600] hover:bg-[#FFC300] text-purple-900';

const PaymentButton: React.FC<PaymentButtonProps> = ({
  type,
  price,
  onClick,
  disabled = false,
  children,
  className = '',
  itemImage,
  useInDialog = false,
}) => {
  const iconSrc = type === 'pi' ? '/pi-logo.png' : '/flappycoins.png';
  const iconAlt = type === 'pi' ? 'Pi' : 'Flappy Coin';
  const buttonClass =
    baseClass +
    ' ' +
    (type === 'pi' ? piClass : coinsClass) +
    (disabled ? ' opacity-60 cursor-not-allowed' : '') +
    (className ? ' ' + className : '');

  return (
    <button onClick={onClick} className={buttonClass} disabled={disabled} type="button">
      <img src={iconSrc} alt={iconAlt} className="mr-2 h-6 w-6 inline-block align-middle" />
      {children ? children : `Buy for ${price} ${type === 'pi' ? 'Pi' : 'Coins'}`}
    </button>
  );
};

export default PaymentButton; 