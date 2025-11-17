import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2, Send, Users, Trophy, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { a2uPaymentService } from '../services/a2uPaymentService';
import { useToast } from './ui/use-toast';

interface A2UPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserUid?: string;
  defaultAmount?: number;
  defaultMemo?: string;
}

const A2UPaymentModal: React.FC<A2UPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultUserUid = '',
  defaultAmount = 0,
  defaultMemo = ''
}) => {
  const [userUid, setUserUid] = useState(defaultUserUid);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [memo, setMemo] = useState(defaultMemo);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSendPayment = async () => {
    if (!userUid.trim() || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid user UID and amount.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await a2uPaymentService.sendPayment({
        userUid: userUid.trim(),
        amount: parseFloat(amount),
        memo: memo.trim() || `Flappy Pi Payment - ${new Date().toLocaleDateString()}`,
        metadata: {
          type: 'manual_payment',
          timestamp: Date.now()
        }
      });

      setResult(response);

      if (response.success) {
        toast({
          title: "Payment Sent Successfully! 🎉",
          description: `Payment of ${amount} Pi sent to user ${userUid}`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: response.error || "Failed to send payment",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserUid(defaultUserUid);
    setAmount(defaultAmount.toString());
    setMemo(defaultMemo);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Pi Payment
          </CardTitle>
          <CardDescription>
            Send Pi cryptocurrency to a user (App-to-User payment)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User UID Input */}
          <div className="space-y-2">
            <Label htmlFor="userUid">User UID</Label>
            <Input
              id="userUid"
              value={userUid}
              onChange={(e) => setUserUid(e.target.value)}
              placeholder="Enter user UID"
              disabled={isLoading}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Pi)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>

          {/* Memo Input */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment description"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Payment Sent Successfully!' : 'Payment Failed'}
                  </p>
                  {result.success && result.paymentId && (
                    <p className="text-sm text-green-600 mt-1">
                      Payment ID: {result.paymentId}
                    </p>
                  )}
                  {result.success && result.txid && (
                    <p className="text-sm text-green-600 mt-1">
                      Transaction ID: {result.txid}
                    </p>
                  )}
                  {!result.success && result.error && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSendPayment}
              disabled={isLoading || !userUid.trim() || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default A2UPaymentModal;
