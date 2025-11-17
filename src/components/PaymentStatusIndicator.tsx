
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { paymentStatusService } from '@/services/paymentStatusService';

interface PaymentStatusIndicatorProps {
  paymentId?: string;
  initialStatus?: string;
  onStatusChange?: (status: string) => void;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  paymentId,
  initialStatus = 'pending',
  onStatusChange
}) => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!paymentId) return;

    const handleStatusUpdate = (newStatus: string) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    };

    paymentStatusService.startPaymentStatusMonitoring(paymentId, handleStatusUpdate);

    return () => {
      paymentStatusService.stopPaymentStatusMonitoring(paymentId);
    };
  }, [paymentId, onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'approved':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      pending: 'secondary',
      approved: 'secondary',
      failed: 'destructive',
      cancelled: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize flex items-center gap-1">
        {status === 'pending' || status === 'approved' ? (
          <Spinner className="w-3 h-3" />
        ) : (
          getStatusIcon()
        )}
        {status}
      </Badge>
    );
  };

  return getStatusBadge();
};

export default PaymentStatusIndicator;
