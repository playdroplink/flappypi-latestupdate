import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface ImprovedPaymentSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'payment' | 'processing' | 'success';
  message?: string;
  showIcon?: boolean;
}

export function ImprovedPaymentSpinner({ 
  className, 
  size = 'md', 
  variant = 'default',
  message,
  showIcon = true
}: ImprovedPaymentSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getSpinnerContent = () => {
    switch (variant) {
      case 'payment':
        return (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {/* Outer ring */}
              <div className={cn(
                "border-4 border-blue-200 rounded-full animate-pulse",
                sizeClasses[size]
              )} />
              
              {/* Spinning ring */}
              <div className={cn(
                "absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin",
                sizeClasses[size]
              )} />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            {message && (
              <p className="text-sm text-gray-600 animate-pulse">{message}</p>
            )}
          </div>
        );
      
      case 'processing':
        return (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
            </div>
            {message && (
              <p className="text-sm text-gray-600">{message}</p>
            )}
          </div>
        );
      
      case 'success':
        return (
          <div className="flex flex-col items-center space-y-3">
            <CheckCircle className={cn("text-green-500 animate-bounce", sizeClasses[size])} />
            {message && (
              <p className="text-sm text-green-600 font-medium">{message}</p>
            )}
          </div>
        );
      
      default:
        return (
          <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
        );
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {getSpinnerContent()}
    </div>
  );
}

// Enhanced payment loading overlay
export function EnhancedPaymentLoadingOverlay({ 
  message = "Processing Payment...",
  showProgress = true,
  progress = 75,
  steps = [
    "Validating payment...",
    "Processing transaction...",
    "Updating inventory..."
  ]
}: { 
  message?: string;
  showProgress?: boolean;
  progress?: number;
  steps?: string[];
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Payment Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Spinner */}
        <div className="mb-6">
          <ImprovedPaymentSpinner 
            variant="payment" 
            size="lg" 
            message={message}
          />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Status indicators */}
        <div className="space-y-2 text-xs text-gray-500">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                index === 0 ? "bg-green-500" : 
                index === 1 ? "bg-blue-500" : "bg-purple-500"
              )} />
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Security indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-3 h-3" />
          <span>Secure payment processing</span>
        </div>
      </div>
    </div>
  );
}

// Payment button with integrated spinner
export function PaymentButtonWithSpinner({
  isLoading,
  loadingText = "Processing...",
  children,
  className,
  ...props
}: {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 transition-all duration-200",
        isLoading && "opacity-75 cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <ImprovedPaymentSpinner size="sm" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default ImprovedPaymentSpinner;
