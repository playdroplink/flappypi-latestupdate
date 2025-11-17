import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { paymentHistoryService, PaymentHistoryItem } from '@/services/paymentHistoryService';
import { format } from 'date-fns';
import PaymentStatusIndicator from '@/components/PaymentStatusIndicator';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const fetchedPayments = await paymentHistoryService.getPaymentHistory();
      setPayments(fetchedPayments);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = (paymentId: string, newStatus: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.pi_transaction_id === paymentId
          ? { ...payment, payment_status: newStatus as any }
          : payment
      )
    );
  };

  const formatAmount = (payment: PaymentHistoryItem) => {
    if (payment.payment_type === 'pi_payment' && payment.amount_pi > 0) {
      return `${payment.amount_pi} π`;
    } else if (payment.amount_coins > 0) {
      return `${payment.amount_coins} coins`;
    }
    return 'Free';
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200">
      <BackgroundDecoration />
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Payment History</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Review all your purchases and transactions in Flappy Pi.</p>

        <div className="w-full flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={loadPaymentHistory}
            disabled={loading}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700"
          >
            {loading ? <Spinner className="w-4 h-4" /> : 'Refresh'}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12 w-full">
            <Spinner className="w-8 h-8 text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <Card className="w-full bg-white/80 border-blue-200 shadow-md">
            <CardContent className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Payment History
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't made any purchases yet. Start exploring our shop!
              </p>
              <Button
                onClick={() => navigate('/shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 shadow-md"
              >
                Browse Shop
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment History List */}
        {!loading && payments.length > 0 && (
          <div className="space-y-4 w-full">
            {payments.map((payment) => (
              <Card key={payment.id} className="bg-white/80 border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-blue-800">{payment.item_name}</h3>
                        <PaymentStatusIndicator
                          paymentId={payment.pi_transaction_id}
                          initialStatus={payment.payment_status}
                          onStatusChange={(newStatus) =>
                            handlePaymentStatusChange(payment.pi_transaction_id || '', newStatus)
                          }
                        />
                      </div>

                      {payment.item_description && (
                        <p className="text-gray-700 text-sm mb-3">{payment.item_description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <span className="capitalize">
                          {payment.payment_type.replace('_', ' ')}
                        </span>
                        {payment.pi_transaction_id && (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {payment.pi_transaction_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {formatAmount(payment)}
                      </div>
                      {payment.completed_at && (
                        <div className="text-xs text-gray-500">
                          Completed {format(new Date(payment.completed_at), 'MMM dd, HH:mm')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && payments.length >= 50 && (
          <div className="text-center mt-8 w-full">
            <Button variant="outline" onClick={loadPaymentHistory} className="bg-blue-50 hover:bg-blue-100 text-blue-700">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
