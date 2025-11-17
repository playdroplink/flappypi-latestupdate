import React from 'react';
import { cn } from "@/lib/utils";

interface ProfessionalSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dots' | 'pulse' | 'ring' | 'bars';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function ProfessionalSpinner({ 
  className, 
  size = 'md', 
  variant = 'ring',
  color = 'primary' 
}: ProfessionalSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  colorClasses[color]
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={cn("relative", sizeClasses[size], className)}>
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-75",
              colorClasses[color]
            )} />
            <div className={cn(
              "relative rounded-full border-2 border-current",
              sizeClasses[size],
              colorClasses[color]
            )} />
          </div>
        );

      case 'bars':
        return (
          <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full animate-pulse",
                  colorClasses[color]
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s',
                  height: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'
                }}
              />
            ))}
          </div>
        );

      case 'ring':
      default:
        return (
          <div className={cn("relative", sizeClasses[size], className)}>
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-gray-200",
              sizeClasses[size]
            )} />
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin",
              sizeClasses[size],
              colorClasses[color]
            )} />
          </div>
        );
    }
  };

  return renderSpinner();
}

// Specialized payment spinner with enhanced animations
export function PaymentSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-pulse" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-ping" />
      </div>
    </div>
  );
}

// Loading overlay for payment processing
export function PaymentLoadingOverlay({ 
  message = "Processing Payment...",
  showProgress = true 
}: { 
  message?: string;
  showProgress?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Payment Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        {/* Spinner */}
        <div className="mb-6">
          <PaymentSpinner />
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {message}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Please wait while we process your payment securely...
        </p>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" 
              style={{ width: '75%' }}
            />
          </div>
        )}

        {/* Status indicators */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Validating payment...</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Processing transaction...</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Updating inventory...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
