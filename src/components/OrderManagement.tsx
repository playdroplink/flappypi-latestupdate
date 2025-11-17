// Order Management Component
// Displays order history and payment status

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  CreditCard,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { piMainnetWalletService, PaymentOrder } from '@/services/piMainnetWalletService';
import { piBackendService } from '@/services/piBackendService';
import { piAuth } from '@/config/piAuth';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      
      const currentUser = piAuth.getCurrentUser();
      if (currentUser) {
        const userOrders = piMainnetWalletService.getUserOrders(currentUser.uid);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'subscription': return <CreditCard className="w-4 h-4" />;
      case 'shop_item': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTransaction = (txid: string) => {
    if (txid) {
      window.open(`https://minepi.com/blockchain/transactions/${txid}`, '_blank');
    }
  };

  const handleRefreshOrders = () => {
    loadOrders();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">
            View and manage your payment orders and transaction history
          </p>
        </div>
        <Button onClick={handleRefreshOrders} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'approved', 'completed', 'failed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? "You haven't made any purchases yet."
                  : `No orders with status "${selectedStatus}" found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getItemTypeIcon(order.itemType)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.itemName}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Order ID:</span>
                        <p className="font-mono text-xs">{order.orderId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-green-600 font-medium">{order.amount} π</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {order.memo && (
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-600">Memo:</span>
                        <p className="text-sm text-gray-800">{order.memo}</p>
                      </div>
                    )}

                    {order.txid && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTransaction(order.txid!)}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Transaction
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.amount, 0)
                    .toFixed(2)} π
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderManagement;
