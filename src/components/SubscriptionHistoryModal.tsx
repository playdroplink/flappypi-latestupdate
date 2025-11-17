import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserProfile } from '@/hooks/useUserProfile';
import { subscriptionService } from '@/services/subscriptionService';
import { 
  History, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package
} from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubscriptionRecord {
  id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  amount_pi?: number;
  pi_transaction_id?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
}

const SubscriptionHistoryModal: React.FC<SubscriptionHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useUserProfile();

  useEffect(() => {
    if (isOpen && profile?.pi_user_id) {
      loadSubscriptionHistory();
    }
  }, [isOpen, profile?.pi_user_id]);

  const loadSubscriptionHistory = async () => {
    if (!profile?.pi_user_id) return;

    setLoading(true);
    try {
      const history = await subscriptionService.getSubscriptionHistory(profile.pi_user_id);
      setSubscriptions(history);
    } catch (error) {
      console.error('Error loading subscription history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Subscription History</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading subscription history...</p>
              </div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription History</h3>
              <p className="text-gray-600">You haven't made any subscription purchases yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {subscription.plan_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Plan ID: {subscription.plan_id}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(subscription.status)} flex items-center space-x-1`}>
                      {getStatusIcon(subscription.status)}
                      <span className="capitalize">{subscription.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-gray-600">Started:</span>
                        <div className="font-medium">
                          {format(new Date(subscription.start_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-gray-600">Expires:</span>
                        <div className="font-medium">
                          {format(new Date(subscription.end_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    {subscription.amount_pi && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <div className="font-medium">
                            {subscription.amount_pi} π
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.pi_transaction_id && (
                      <div>
                        <span className="text-gray-600">Transaction:</span>
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {subscription.pi_transaction_id.substring(0, 12)}...
                        </div>
                      </div>
                    )}
                  </div>

                  {subscription.cancelled_at && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <XCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-800">
                          Cancelled on {format(new Date(subscription.cancelled_at), 'MMM dd, yyyy')}
                        </span>
                        {subscription.cancellation_reason && (
                          <span className="text-orange-700">
                            - {subscription.cancellation_reason.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionHistoryModal;
