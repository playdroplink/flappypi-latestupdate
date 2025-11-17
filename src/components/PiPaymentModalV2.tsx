import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Lock } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';

interface PiPaymentModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  item: { name: string; description?: string; piAmount: number; image?: string; quantity?: number } | null;
  onPayment: () => Promise<{ success: boolean; txid?: string; error?: string }>;
  onPaymentSuccess: (txid: string) => void;
}

enum PaymentState {
  SUMMARY = 'summary',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

const PiPaymentModalV2: React.FC<PiPaymentModalV2Props> = ({
  isOpen,
  onClose,
  item,
  onPayment,
  onPaymentSuccess,
}) => {
  const [state, setState] = useState<PaymentState>(PaymentState.SUMMARY);
  const [error, setError] = useState<string>('');
  const [txid, setTxid] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setState(PaymentState.SUMMARY);
      setError('');
      setTxid('');
    }
  }, [isOpen]);

  const handlePay = async () => {
    setState(PaymentState.PROCESSING);
    setError('');
    setTxid('');
    try {
      const result = await onPayment();
      if (result.success) {
        setTxid(result.txid || '');
        setState(PaymentState.SUCCESS);
      } else {
        setError(result.error || 'Payment failed.');
        setState(PaymentState.ERROR);
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected error.');
      setState(PaymentState.ERROR);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Pi Network Payment</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            Secure payment powered by Pi Network
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Lock className="w-4 h-4 mr-1" /> Secure & Trusted
          </Badge>
        </DialogHeader>
        
        <div className="px-8 pb-8">
          {state === PaymentState.SUMMARY && (
            <>
              <div className="flex flex-col items-center mb-4">
                {item?.image && <img src={item.image === '/subscription-plan.png' ? '/@subscriptionplan%20button.png' : item.image} alt={item.name} className="w-20 h-20 mb-2 rounded-xl shadow-lg" />}
                <div className="text-lg font-semibold text-gray-800 mb-1">{item?.name}</div>
                <div className="text-sm text-gray-500 mb-2 text-center">{item?.description}</div>
                {item?.quantity && item.quantity > 1 && (
                  <div className="text-purple-700 font-bold mb-2">x{item.quantity}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <img src="/pi-logo.png" alt="Pi Logo" className="w-6 h-6" />
                  <span className="text-xl font-bold text-yellow-600">{item?.piAmount} π</span>
                </div>
              </div>
              <DialogFooter className="mt-6 flex flex-col gap-2">
                <Button variant="default" size="lg" onClick={handlePay} className="w-full text-lg">
                  <img src="/pi-logo.png" alt="Pi Logo" className="w-5 h-5 mr-2" />
                  Pay with Pi
                </Button>
                <Button variant="secondary" size="lg" onClick={onClose} className="w-full text-lg">
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
          {state === PaymentState.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="w-12 h-12 text-purple-500 mb-4" />
              <div className="text-lg font-semibold text-purple-700 mb-2">Processing Payment...</div>
              <div className="text-gray-500 text-sm text-center">Please approve the transaction in your Pi Browser.</div>
            </div>
          )}
          {state === PaymentState.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-8">
              <Check className="w-16 h-16 text-green-500 mb-4" />
              <div className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</div>
              <div className="text-gray-600 text-center mb-2">Thank you for your purchase.</div>
              {txid && <div className="text-xs text-gray-400 break-all text-center">Transaction ID: {txid}</div>}
              <Button variant="default" size="lg" onClick={onClose} className="w-full mt-6">Close</Button>
            </div>
          )}
          {state === PaymentState.ERROR && (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <div className="text-2xl font-bold text-red-700 mb-2">Payment Failed</div>
              <div className="text-gray-600 text-center mb-2">{error}</div>
              <Button variant="default" size="lg" onClick={handlePay} className="w-full mt-4">Try Again</Button>
              <Button variant="secondary" size="lg" onClick={onClose} className="w-full mt-2">Cancel</Button>
            </div>
          )}
        </div>
        <div className="text-center text-xs text-gray-400 pb-4">Powered by Pi Network</div>
      </DialogContent>
    </Dialog>
  );
};

export default PiPaymentModalV2; 