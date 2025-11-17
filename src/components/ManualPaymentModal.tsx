import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  X, 
  RefreshCw,
  Wallet,
  Shield,
  AlertCircle,
  Info,
  Download,
  Smartphone,
  Monitor,
  CreditCard,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentService, ManualPaymentTransaction, ManualPaymentVerification } from '@/services/manualPaymentService';
import { PI_CONFIG } from '@/config/piConfig';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onPaymentSuccess: (transaction: ManualPaymentTransaction) => void;
  onPaymentError: (error: string) => void;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  
  // State management
  const [transaction, setTransaction] = useState<ManualPaymentTransaction | null>(null);
  const [paymentStep, setPaymentStep] = useState<'init' | 'payment' | 'verification' | 'success' | 'error'>('init');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [piTransactionHash, setPiTransactionHash] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [paymentProgress, setPaymentProgress] = useState(0);

  // Initialize payment transaction
  useEffect(() => {
    if (isOpen && item && paymentStep === 'init') {
      initializePayment();
    }
  }, [isOpen, item, paymentStep]);

  // Timer for payment expiry
  useEffect(() => {
    if (transaction && paymentStep === 'payment') {
      const timer = setInterval(() => {
        const remaining = manualPaymentService.getTransactionTimeRemaining(transaction);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setPaymentStep('error');
          onPaymentError('Payment session expired');
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [transaction, paymentStep]);

  const initializePayment = async () => {
    try {
      setPaymentStatus('processing');
      
      // Create manual payment transaction
      const newTransaction = await manualPaymentService.createManualTransaction(
        item.id,
        item.name,
        customerEmail || 'customer@example.com',
        customerName || 'Customer',
        1,
        item.piPrice,
        'PI',
        item.piPrice,
        item.piPrice,
        `Purchase: ${item.name}`
      );
      
      setTransaction(newTransaction);
      setPaymentStep('payment');
      setPaymentStatus('pending');
      
      toast({
        title: "Payment Initialized",
        description: "QR code and wallet address generated. Please complete payment within 30 minutes.",
      });
      
    } catch (error) {
      console.error('Error initializing payment:', error);
      setPaymentStep('error');
      onPaymentError('Failed to initialize payment');
    }
  };

  const copyToClipboard = async (text: string, type: 'address' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'address') {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
        toast({
          title: "Wallet Address Copied",
          description: "Pi wallet address copied to clipboard",
        });
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast({
          title: "Verification Code Copied",
          description: "Verification code copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleVerification = async () => {
    if (!transaction || !verificationCode) {
      toast({
        title: "Verification Required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setPaymentStatus('processing');

    try {
      const verification: ManualPaymentVerification = {
        transactionId: transaction.transactionId,
        verificationCode: verificationCode,
        customerEmail: customerEmail || transaction.customerEmail,
        piTransactionHash: piTransactionHash || undefined,
        amount: transaction.totalPiAmount,
        timestamp: new Date()
      };

      const result = await manualPaymentService.verifyPayment(verification);

      if (result.success && result.transaction) {
        setPaymentStep('success');
        setPaymentStatus('completed');
        onPaymentSuccess(result.transaction);
        
        toast({
          title: "Payment Verified! 🎉",
          description: `${item.name} has been added to your collection.`,
        });
      } else {
        setPaymentStep('error');
        setPaymentStatus('failed');
        onPaymentError(result.error || 'Verification failed');
        
        toast({
          title: "Verification Failed",
          description: result.error || 'Please check your verification code and try again.',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStep('error');
      setPaymentStatus('failed');
      onPaymentError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetPayment = () => {
    setTransaction(null);
    setPaymentStep('init');
    setPaymentStatus('pending');
    setTimeRemaining(0);
    setVerificationCode('');
    setPiTransactionHash('');
    setCopiedAddress(false);
    setCopiedCode(false);
  };

  const openPiWallet = () => {
    // Open Pi Browser or Pi Wallet app
    const piWalletUrl = `pinet://payment?address=${manualPaymentService.getMerchantWalletAddress()}&amount=${item.piPrice}&memo=Flappy Pi: ${item.name}`;
    window.open(piWalletUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
                         <div>
               <h2 className="text-xl font-bold text-gray-900">
                 Manual Pi Payment
                 <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                   MAINNET MODE
                 </span>
               </h2>
               <p className="text-sm text-gray-600">
                 Mainnet production mode - Real Pi payments required
               </p>
             </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Steps */}
          {paymentStep === 'init' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{item.piPrice} π</div>
                      <div className="text-sm text-gray-500">Pi Network</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="customer-name">Your Name (Optional)</Label>
                    <Input
                      id="customer-name"
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="customer-email">Email Address (Optional)</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="Enter your email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={initializePayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Initializing Payment...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate Payment QR Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment QR Code and Wallet Address */}
          {paymentStep === 'payment' && transaction && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <QrCode className="mr-2" />
                      Payment QR Code
                    </div>
                    <Badge variant={timeRemaining > 0 ? "default" : "destructive"}>
                      <Clock className="w-3 h-3 mr-1" />
                      {manualPaymentService.formatTimeRemaining(timeRemaining)}
                    </Badge>
                  </CardTitle>
                                     <CardDescription>
                     {PI_CONFIG.isSandbox() 
                       ? 'Sandbox mode - QR code for testing purposes only'
                       : 'Scan this QR code with your Pi Wallet app to complete payment'
                     }
                   </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img
                        src={transaction.qrCodeDataUrl}
                        alt="Payment QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label>Pi Wallet Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={transaction.merchantWalletAddress}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(transaction.merchantWalletAddress, 'address')}
                        variant="outline"
                        size="sm"
                      >
                        {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-semibold">{transaction.totalPiAmount} π</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Transaction ID</div>
                      <div className="font-mono text-xs">{transaction.transactionId}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={openPiWallet}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Open Pi Wallet
                    </Button>
                    <Button
                      onClick={() => setPaymentStep('verification')}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      I've Paid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Verification */}
          {paymentStep === 'verification' && transaction && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" />
                    Payment Verification
                  </CardTitle>
                  <CardDescription>
                    Enter the verification code to confirm your payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verification Code */}
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        className="text-center text-lg font-mono"
                      />
                      <Button
                        onClick={() => copyToClipboard(transaction.verificationCode, 'code')}
                        variant="outline"
                        size="sm"
                      >
                        {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Verification code: <span className="font-mono font-bold">{transaction.verificationCode}</span>
                    </div>
                  </div>

                  {/* Pi Transaction Hash (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="pi-transaction-hash">Pi Transaction Hash (Optional)</Label>
                    <Input
                      id="pi-transaction-hash"
                      placeholder="Enter transaction hash from Pi Wallet"
                      value={piTransactionHash}
                      onChange={(e) => setPiTransactionHash(e.target.value)}
                      className="font-mono text-sm"
                    />
                                         <div className="text-xs text-gray-500">
                       {PI_CONFIG.isSandbox() 
                         ? 'Sandbox mode - Transaction hash is optional for testing'
                         : 'This helps verify your payment on the Pi blockchain'
                       }
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setPaymentStep('payment')}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Payment
                    </Button>
                    <Button
                      onClick={handleVerification}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isVerifying || !verificationCode}
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Payment
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success State */}
          {paymentStep === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful! 🎉</h3>
                <p className="text-gray-600">
                  Your payment has been verified and {item.name} has been added to your collection.
                </p>
              </div>
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                Continue Shopping
              </Button>
            </div>
          )}

          {/* Error State */}
          {paymentStep === 'error' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-600">
                  There was an issue with your payment. Please try again.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <Button onClick={resetPayment} variant="outline">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
                       <div className="flex items-center space-x-4">
             <div className="flex items-center">
               <Shield className="w-4 h-4 mr-1" />
               {PI_CONFIG.isSandbox() ? 'Sandbox Mode' : 'Secure Payment'}
             </div>
             <div className="flex items-center">
               <Zap className="w-4 h-4 mr-1" />
               Pi Network
             </div>
           </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentModal;
