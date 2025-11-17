import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dualPaymentService, DualPaymentTransaction } from '@/services/dualPaymentService';
import { usePiBrowserDetection } from '@/hooks/usePiBrowserDetection';
import { 
  Zap, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X,
  Pi,
  Wallet,
  Shield,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';

interface DualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description?: string;
    piPrice: number;
    image?: string;
  };
  onPaymentSuccess: (transaction: DualPaymentTransaction) => void;
  onPaymentError: (error: string) => void;
}

const DualPaymentModal: React.FC<DualPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'pi_sdk' | 'manual_ledger'>('pi_sdk');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState<DualPaymentTransaction | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [piTransactionHash, setPiTransactionHash] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  const { toast } = useToast();
  const { isPiBrowser } = usePiBrowserDetection();

  useEffect(() => {
    if (isOpen && paymentMethod === 'manual_ledger') {
      createManualTransaction();
    }
  }, [isOpen, paymentMethod]);

  useEffect(() => {
    if (transaction && paymentMethod === 'manual_ledger') {
      const interval = setInterval(() => {
        const remaining = dualPaymentService.getTransactionTimeRemaining(transaction);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
          toast({
            title: "Payment Expired",
            description: "The payment request has expired. Please try again.",
            variant: "destructive"
          });
          onClose();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [transaction, paymentMethod]);

  const createManualTransaction = async () => {
    try {
      const newTransaction = await dualPaymentService.createDualTransaction(
        item.id,
        item.name,
        customerEmail || 'customer@example.com',
        customerName || 'Customer',
        1,
        item.piPrice,
        'Pi',
        item.piPrice,
        item.piPrice,
        `Purchase of ${item.name}`
      );

      // Update payment method
      newTransaction.paymentMethod = 'manual_ledger';
      dualPaymentService.updateTransactionStatus(newTransaction.transactionId, 'pending');
      
      setTransaction(newTransaction);

      // Generate QR code for the payment
      if (newTransaction.merchantWalletAddress) {
        const qrData = {
          address: newTransaction.merchantWalletAddress,
          amount: newTransaction.totalPiAmount,
          memo: newTransaction.orderId,
          network: 'mainnet'
        };
        
        try {
          const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 200,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
          });
          setQrCodeDataUrl(qrCode);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    } catch (error) {
      console.error('Error creating manual transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create payment request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePiSDKPayment = async () => {
    if (!isPiBrowser) {
      toast({
        title: "Pi Browser Required",
        description: "Please use Pi Browser to make Pi payments.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await dualPaymentService.processPiSDKPayment(
        item.piPrice,
        `Flappy Pi: ${item.name}`,
        {
          type: 'item_purchase',
          itemId: item.id,
          itemName: item.name,
          game: 'flappy_pi',
          price: item.piPrice,
          timestamp: Date.now()
        }
      );

      if (result.success) {
        toast({
          title: "Payment Successful! 🎉",
          description: `${item.name} has been unlocked!`
        });
        onPaymentSuccess(transaction!);
        onClose();
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment was not completed.",
          variant: "destructive"
        });
        onPaymentError(result.error || "Payment failed");
      }
    } catch (error) {
      console.error('Pi SDK payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment failed",
        variant: "destructive"
      });
      onPaymentError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPaymentVerification = async () => {
    if (!transaction) return;

    setIsProcessing(true);
    try {
      const result = await dualPaymentService.verifyManualPayment({
        transactionId: transaction.transactionId,
        verificationCode,
        customerEmail: customerEmail || 'customer@example.com',
        piTransactionHash,
        amount: transaction.totalPiAmount,
        timestamp: new Date()
      });

      if (result.success) {
        toast({
          title: "Payment Verified! 🎉",
          description: `${item.name} has been unlocked!`
        });
        onPaymentSuccess(result.transaction!);
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Payment verification failed.",
          variant: "destructive"
        });
        onPaymentError(result.error || "Verification failed");
      }
    } catch (error) {
      console.error('Manual payment verification error:', error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive"
      });
      onPaymentError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard"
    });
  };

  const getMerchantWalletInfo = () => {
    return {
      address: dualPaymentService.getMerchantWalletAddress(),
      username: dualPaymentService.getMerchantWalletUsername()
    };
  };

  if (!isOpen) return null;

  console.log('DualPaymentModal is rendering with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full bg-white/95 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-0 animate-fade-in relative overflow-hidden">
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <Zap className="w-6 h-6 text-yellow-500" />
              Choose Payment Method
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Select your preferred payment method for {item.name}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="relative z-10 p-6">
          {/* Payment Method Selection */}
          {!showManualPayment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pi SDK Payment Option */}
              <Card className={`p-6 border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                paymentMethod === 'pi_sdk' 
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-yellow-200'
              }`} onClick={() => setPaymentMethod('pi_sdk')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-yellow-500 rounded-full">
                      <Pi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-800">Pi SDK Payment</CardTitle>
                      <CardDescription className="text-gray-600">Instant & Secure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-yellow-600">{item.piPrice} Pi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Instant unlock
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Pi Network verified
                    </div>
                    {!isPiBrowser && (
                      <div className="flex items-center gap-2 text-sm text-orange-500 bg-orange-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        Pi Browser recommended
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Ledger Payment Option */}
              <Card className={`p-6 border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                paymentMethod === 'manual_ledger' 
                  ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-blue-200'
              }`} onClick={() => setPaymentMethod('manual_ledger')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-800">Manual Payment</CardTitle>
                      <CardDescription className="text-gray-600">Direct to Wallet</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-blue-600">{item.piPrice} Pi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 text-blue-500" />
                      30 min expiry
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <QrCode className="w-4 h-4 text-green-500" />
                      QR code available
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="w-4 h-4 text-purple-500" />
                      Manual verification
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pi SDK Payment Flow */}
          {paymentMethod === 'pi_sdk' && !showManualPayment && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pi SDK Payment</h3>
                <p className="text-gray-600">Click the button below to process your payment through Pi Network</p>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handlePiSDKPayment}
                  disabled={isProcessing || !isPiBrowser}
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <img src="/pi-logo.png" alt="Pi" className="h-6 w-6" />
                      Pay {item.piPrice} Pi
                    </div>
                  )}
                </Button>
              </div>

              {!isPiBrowser && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Pi Browser Recommended</span>
                  </div>
                  <p className="text-orange-600 text-sm mt-1">
                    For the best experience and secure payments, we recommend using Pi Browser.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Payment Flow */}
          {paymentMethod === 'manual_ledger' && (
            <div className="space-y-6">
              {!showManualPayment ? (
                <div className="text-center">
                  <Button
                    onClick={() => setShowManualPayment(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Continue with Manual Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                        Your Name
                      </Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Payment Details */}
                  {transaction && (
                    <Card className="p-4 bg-gray-50 border border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Transaction ID:</span>
                          <p className="font-mono text-xs bg-white p-2 rounded mt-1">{transaction.transactionId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Order ID:</span>
                          <p className="font-mono text-xs bg-white p-2 rounded mt-1">{transaction.orderId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Verification Code:</span>
                          <p className="font-mono text-lg font-bold text-blue-600 bg-white p-2 rounded mt-1">{transaction.verificationCode}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Time Remaining:</span>
                          <p className="font-mono text-lg font-bold text-red-600 bg-white p-2 rounded mt-1">
                            {dualPaymentService.formatTimeRemaining(timeRemaining)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Wallet Information */}
                  <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Send Payment To</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Wallet Address:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={getMerchantWalletInfo().address}
                            readOnly
                            className="font-mono text-xs bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(getMerchantWalletInfo().address)}
                            className="px-3"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Username:</Label>
                        <p className="text-blue-800 font-medium">{getMerchantWalletInfo().username}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Amount:</Label>
                        <p className="text-blue-800 font-bold text-lg">{item.piPrice} Pi</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-blue-700">Memo:</Label>
                        <p className="font-mono text-xs bg-white p-2 rounded mt-1">{transaction?.orderId || 'N/A'}</p>
                      </div>
                    </div>
                  </Card>

                  {/* QR Code */}
                  {qrCodeDataUrl && (
                    <Card className="p-4 bg-white border border-gray-200">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 mb-3">Scan QR Code</h4>
                        <div className="flex justify-center">
                          <img src={qrCodeDataUrl} alt="Payment QR Code" className="border border-gray-200 rounded-lg" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Scan this QR code with your Pi wallet app
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Verification Form */}
                  <Card className="p-4 bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Verify Payment</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="piTransactionHash" className="text-sm font-medium text-green-700">
                          Pi Transaction Hash (Optional)
                        </Label>
                        <Input
                          id="piTransactionHash"
                          value={piTransactionHash}
                          onChange={(e) => setPiTransactionHash(e.target.value)}
                          placeholder="Enter transaction hash from your wallet"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="verificationCode" className="text-sm font-medium text-green-700">
                          Verification Code *
                        </Label>
                        <Input
                          id="verificationCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter the 6-digit code above"
                          className="mt-1"
                          maxLength={6}
                        />
                      </div>
                      
                      <Button
                        onClick={handleManualPaymentVerification}
                        disabled={isProcessing || !verificationCode}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Verifying...
                          </div>
                        ) : (
                          'Verify Payment'
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            {paymentMethod === 'manual_ledger' && showManualPayment && (
              <Button
                variant="outline"
                onClick={() => setShowManualPayment(false)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                ← Back to Selection
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DualPaymentModal;
