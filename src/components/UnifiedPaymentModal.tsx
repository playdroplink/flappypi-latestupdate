import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentSpinner, PaymentLoadingOverlay } from '@/components/ui/professional-spinner';
import { ImprovedPaymentSpinner, EnhancedPaymentLoadingOverlay } from '@/components/ui/ImprovedPaymentSpinner';
import { Coins, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentModalState, PaymentItem } from '@/services/unifiedShopPaymentService';
import ImageWithFallback from '@/components/ImageWithFallback';

interface UnifiedPaymentModalProps {
  paymentModal: PaymentModalState;
  onConfirm: () => void;
  onClose: () => void;
  onCancel: () => void;
}

const UnifiedPaymentModal: React.FC<UnifiedPaymentModalProps> = ({
  paymentModal,
  onConfirm,
  onClose,
  onCancel
}) => {
  if (!paymentModal.item) return null;

  const item = paymentModal.item;
  const quantity = item.quantity || 1;
  const totalPiPrice = item.piPrice * quantity;
  const totalCoinPrice = (item.coinPrice || 0) * quantity;

  const getPaymentMethodIcon = () => {
    return paymentModal.type === 'pi' ? (
      <CreditCard className="w-5 h-5 text-blue-500" />
    ) : (
      <Coins className="w-5 h-5 text-yellow-500" />
    );
  };

  const getPaymentMethodText = () => {
    return paymentModal.type === 'pi' ? 'Pi Payment' : 'Coin Payment';
  };

  const getTotalPrice = () => {
    if (paymentModal.type === 'pi') {
      return `${totalPiPrice} Pi`;
    } else {
      return `${totalCoinPrice} Coins`;
    }
  };

  const getPaymentDescription = () => {
    if (paymentModal.type === 'pi') {
      return `Pay ${totalPiPrice} Pi to purchase ${item.name}`;
    } else {
      return `Pay ${totalCoinPrice} Coins to purchase ${item.name}`;
    }
  };

  return (
    <>
      {/* Payment Loading Overlay */}
      {paymentModal.loading && (
        <EnhancedPaymentLoadingOverlay 
          message={`Processing ${getPaymentMethodText()}...`}
          showProgress={true}
          progress={75}
          steps={[
            "Validating payment...",
            "Processing transaction...",
            "Updating inventory..."
          ]}
        />
      )}
      
            <Dialog open={!!paymentModal.item} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              {getPaymentMethodIcon()}
              Confirm {getPaymentMethodText()}
            </DialogTitle>
            <DialogDescription className="text-base">
              {getPaymentDescription()}
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-4">
          {/* Item Details */}
          <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {item.image && (
                  <div className="relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-md"
                      fallbackSrc="/flappy-logo.png"
                    />
                    {paymentModal.type === 'pi' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">π</span>
                      </div>
                    )}
                    {paymentModal.type === 'coin' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">₪</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                  {quantity > 1 && (
                    <Badge variant="secondary" className="mt-1">
                      Quantity: {quantity}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Price:</span>
                <div className="flex items-center gap-2">
                  {paymentModal.type === 'pi' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-semibold text-blue-600">
                        {totalPiPrice}
                      </span>
                      <span className="text-sm font-medium text-blue-500">Pi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-semibold text-yellow-600">
                        {totalCoinPrice}
                      </span>
                      <span className="text-sm font-medium text-yellow-500">Coins</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {paymentModal.error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">Payment Failed</h4>
                <p className="text-sm text-red-700">{paymentModal.error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {paymentModal.success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 mb-1">Payment Successful!</h4>
                <p className="text-sm text-green-700">
                  {item.name} has been added to your inventory successfully.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!paymentModal.success && (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={paymentModal.loading}
                  className="flex-1 hover:bg-gray-50 transition-colors duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={paymentModal.loading}
                  className={`flex-1 transition-all duration-200 ${
                    paymentModal.type === 'pi' 
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  }`}
                >
                  {paymentModal.loading ? (
                    <>
                      <ImprovedPaymentSpinner size="sm" className="mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {getPaymentMethodIcon()}
                      Confirm {getPaymentMethodText()}
                    </>
                  )}
                </Button>
              </>
            )}
            {paymentModal.success && (
              <Button 
                onClick={onClose} 
                className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500 transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UnifiedPaymentModal;
