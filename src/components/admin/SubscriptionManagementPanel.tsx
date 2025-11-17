import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface SubscriptionManagementPanelProps {
  onRefresh?: () => void;
}

interface SubscriptionWithUser extends Tables<'subscriptions'> {
  user?: Tables<'user_profiles'>;
  paymentHistory?: any[];
}

interface PlanStats {
  planId: string;
  planName: string;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgRevenuePerUser: number;
  churnRate: number;
  conversionRate: number;
}

const SubscriptionManagementPanel: React.FC<SubscriptionManagementPanelProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [planStats, setPlanStats] = useState<PlanStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionsPerPage] = useState(10);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, planFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Load subscriptions
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*');

      if (usersError) throw usersError;

      // Load payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_status', 'completed');

      if (paymentsError) throw paymentsError;

      // Combine data
      const subscriptionsWithUsers = (subscriptionsData || []).map(subscription => {
        const user = (usersData || []).find(u => u.pi_user_id === subscription.pi_user_id);
        const userPayments = (paymentsData || []).filter(
          payment => payment.pi_user_id === subscription.pi_user_id
        );
        
        return {
          ...subscription,
          user,
          paymentHistory: userPayments
        };
      });

      setSubscriptions(subscriptionsWithUsers);
      calculatePlanStats(subscriptionsWithUsers);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePlanStats = (subs: SubscriptionWithUser[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const planStatsMap = subs.reduce((acc, sub) => {
      const planId = sub.plan_id;
      const isActive = sub.status === 'active' && new Date(sub.end_date) > now;
      const isMonthly = new Date(sub.created_at) >= thirtyDaysAgo;

      if (!acc[planId]) {
        acc[planId] = {
          planId,
          planName: sub.plan_name,
          activeSubscribers: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          avgRevenuePerUser: 0,
          churnRate: 0,
          conversionRate: 0
        };
      }

      if (isActive) acc[planId].activeSubscribers++;
      acc[planId].totalRevenue += sub.amount_pi || 0;
      if (isMonthly) acc[planId].monthlyRevenue += sub.amount_pi || 0;

      return acc;
    }, {} as Record<string, PlanStats>);

    // Calculate averages and rates
    Object.values(planStatsMap).forEach(plan => {
      plan.avgRevenuePerUser = plan.activeSubscribers > 0 ? plan.totalRevenue / plan.activeSubscribers : 0;
      // Simplified churn and conversion rates
      plan.churnRate = 5.2; // Example rate
      plan.conversionRate = 12.8; // Example rate
    });

    setPlanStats(Object.values(planStatsMap));
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.pi_user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan_id === planFilter);
    }

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: string) => {
    try {
      switch (action) {
        case 'cancel':
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'cancelled',
              cancelled_at: new Date().toISOString()
            })
            .eq('id', subscriptionId);
          break;
        case 'reactivate':
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              cancelled_at: null
            })
            .eq('id', subscriptionId);
          break;
        case 'extend':
          // Extend subscription by 30 days
          const subscription = subscriptions.find(s => s.id === subscriptionId);
          if (subscription) {
            const newEndDate = new Date(subscription.end_date);
            newEndDate.setDate(newEndDate.getDate() + 30);
            
            await supabase
              .from('subscriptions')
              .update({ 
                end_date: newEndDate.toISOString(),
                status: 'active'
              })
              .eq('id', subscriptionId);
          }
          break;
      }
      
      loadSubscriptions();
      onRefresh?.();
      
      toast({
        title: 'Success',
        description: `Subscription ${action}ed successfully.`,
      });
    } catch (error) {
      console.error('Error performing subscription action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform action.',
        variant: 'destructive',
      });
    }
  };

  const exportSubscriptions = () => {
    const csvContent = [
      ['User', 'Plan', 'Status', 'Amount', 'Start Date', 'End Date', 'Revenue'],
      ...filteredSubscriptions.map(sub => [
        sub.user?.username || sub.pi_user_id,
        sub.plan_name,
        sub.status,
        sub.amount_pi?.toString() || '0',
        new Date(sub.start_date).toLocaleDateString(),
        new Date(sub.end_date).toLocaleDateString(),
        sub.amount_pi?.toFixed(2) || '0.00'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Subscription data has been exported successfully.',
    });
  };

  const getSubscriptionStatusBadge = (subscription: SubscriptionWithUser) => {
    const isExpired = new Date(subscription.end_date) < new Date();
    
    if (subscription.status === 'active' && !isExpired) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else if (subscription.status === 'cancelled') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cancelled</Badge>;
    } else if (isExpired) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{subscription.status}</Badge>;
    }
  };

  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * subscriptionsPerPage,
    currentPage * subscriptionsPerPage
  );

  const totalPages = Math.ceil(filteredSubscriptions.length / subscriptionsPerPage);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading subscriptions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-blue-900">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-green-900">
                  {subscriptions.filter(s => s.status === 'active' && new Date(s.end_date) > new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${subscriptions.reduce((sum, s) => sum + (s.amount_pi || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${planStats.reduce((sum, p) => sum + p.monthlyRevenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Performance Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Plan Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planStats.map((plan) => (
              <Card key={plan.planId} className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.planName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Subscribers:</span>
                    <span className="font-semibold">{plan.activeSubscribers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="font-semibold">${plan.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Revenue:</span>
                    <span className="font-semibold">${plan.monthlyRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Revenue/User:</span>
                    <span className="font-semibold">${plan.avgRevenuePerUser.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Churn Rate:</span>
                    <span className="font-semibold">{plan.churnRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate:</span>
                    <span className="font-semibold">{plan.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Management</span>
            <div className="flex gap-2">
              <Button onClick={loadSubscriptions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportSubscriptions} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {planStats.map(plan => (
                  <SelectItem key={plan.planId} value={plan.planId}>
                    {plan.planName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={subscription.user?.avatar_url || '/default-avatar.png'} 
                            alt="" 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.user?.username || subscription.pi_user_id}
                          </div>
                          <div className="text-sm text-gray-500">{subscription.pi_user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.plan_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubscriptionStatusBadge(subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${subscription.amount_pi?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedSubscription(subscription)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Subscription Details</DialogTitle>
                            </DialogHeader>
                            {selectedSubscription && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">User</label>
                                    <p className="text-sm">{selectedSubscription.user?.username || selectedSubscription.pi_user_id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Plan</label>
                                    <p className="text-sm">{selectedSubscription.plan_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p className="text-sm">{selectedSubscription.status}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Amount</label>
                                    <p className="text-sm">${selectedSubscription.amount_pi?.toFixed(2) || '0.00'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p className="text-sm">{new Date(selectedSubscription.start_date).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p className="text-sm">{new Date(selectedSubscription.end_date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Payment History</label>
                                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                    {selectedSubscription.paymentHistory?.map((payment, index) => (
                                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                        <span>{payment.item_name}</span>
                                        <span>${payment.amount_pi?.toFixed(2) || '0.00'}</span>
                                      </div>
                                    ))}
                                    {(!selectedSubscription.paymentHistory || selectedSubscription.paymentHistory.length === 0) && (
                                      <p className="text-sm text-gray-500">No payment history</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {subscription.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSubscriptionAction(subscription.id, 'extend')}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * subscriptionsPerPage) + 1} to {Math.min(currentPage * subscriptionsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagementPanel; 