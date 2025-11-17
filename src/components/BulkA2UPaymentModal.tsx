import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2, Users, Trophy, Gift, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { a2uPaymentService } from '../services/a2uPaymentService';
import { useToast } from './ui/use-toast';

interface PaymentEntry {
  userUid: string;
  amount: number;
  memo: string;
}

interface BulkA2UPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkA2UPaymentModal: React.FC<BulkA2UPaymentModalProps> = ({
  isOpen,
  onClose
}) => {
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { userUid: '', amount: 0, memo: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const addPayment = () => {
    setPayments([...payments, { userUid: '', amount: 0, memo: '' }]);
  };

  const removePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: keyof PaymentEntry, value: string | number) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };
    setPayments(updated);
  };

  const handleSendBulkPayments = async () => {
    // Validate payments
    const validPayments = payments.filter(p => 
      p.userUid.trim() && p.amount > 0
    );

    if (validPayments.length === 0) {
      toast({
        title: "No Valid Payments",
        description: "Please add at least one valid payment.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await a2uPaymentService.sendBulkPayments({
        payments: validPayments.map(p => ({
          userUid: p.userUid.trim(),
          amount: p.amount,
          memo: p.memo.trim() || `Flappy Pi Bulk Payment - ${new Date().toLocaleDateString()}`,
          metadata: {
            type: 'bulk_payment',
            timestamp: Date.now()
          }
        }))
      });

      setResult(response);

      if (response.success) {
        toast({
          title: "Bulk Payments Sent! 🎉",
          description: `Sent ${response.totalSent} payments successfully, ${response.totalFailed} failed.`,
        });
      } else {
        toast({
          title: "Bulk Payments Failed",
          description: "Failed to send bulk payments",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Bulk payment error:', error);
      toast({
        title: "Bulk Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPayments([{ userUid: '', amount: 0, memo: '' }]);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Send Bulk Pi Payments
          </CardTitle>
          <CardDescription>
            Send Pi cryptocurrency to multiple users at once
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Payment Entries */}
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Payment #{index + 1}</h4>
                  {payments.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePayment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`userUid-${index}`}>User UID</Label>
                    <Input
                      id={`userUid-${index}`}
                      value={payment.userUid}
                      onChange={(e) => updatePayment(index, 'userUid', e.target.value)}
                      placeholder="User UID"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`amount-${index}`}>Amount (Pi)</Label>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={payment.amount || ''}
                      onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`memo-${index}`}>Memo</Label>
                    <Input
                      id={`memo-${index}`}
                      value={payment.memo}
                      onChange={(e) => updatePayment(index, 'memo', e.target.value)}
                      placeholder="Payment description"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Payment Button */}
          <Button
            variant="outline"
            onClick={addPayment}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Payment
          </Button>

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
                    {result.success ? 'Bulk Payments Completed!' : 'Bulk Payments Failed'}
                  </p>
                  {result.success && (
                    <div className="text-sm text-green-600 mt-1">
                      <p>✅ Sent: {result.totalSent} payments</p>
                      <p>❌ Failed: {result.totalFailed} payments</p>
                    </div>
                  )}
                  {!result.success && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: Failed to process bulk payments
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSendBulkPayments}
              disabled={isLoading || payments.every(p => !p.userUid.trim() || p.amount <= 0)}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Send Bulk Payments
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

export default BulkA2UPaymentModal;
