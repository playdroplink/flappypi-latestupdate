import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Crown, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  Settings,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import ImageWithFallback from '@/components/ImageWithFallback';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  subscriptionPlans: SubscriptionPlanStats[];
  userGrowth: UserGrowthData[];
  revenueByPlan: RevenueByPlan[];
}

interface SubscriptionPlanStats {
  planId: string;
  planName: string;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgRevenuePerUser: number;
}

interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

interface RevenueByPlan {
  planId: string;
  planName: string;
  revenue: number;
  subscribers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Tables<'user_profiles'>[]>([]);
  const [subscriptions, setSubscriptions] = useState<Tables<'subscriptions'>[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      // Admin access unlocked - no authentication required
      console.log('🔓 Admin Dashboard: Access unlocked');
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(true); // Always allow access
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      // Load payment history for revenue calculation
      const { data: paymentsData } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_status', 'completed');

      if (usersData) setUsers(usersData);
      if (subscriptionsData) setSubscriptions(subscriptionsData);

      // Calculate stats
      const calculatedStats = calculateStats(usersData || [], subscriptionsData || [], paymentsData || []);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    users: Tables<'user_profiles'>[],
    subscriptions: Tables<'subscriptions'>[],
    payments: any[]
  ): AdminStats => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate subscription plan stats
    const planStats = subscriptions.reduce((acc, sub) => {
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
          avgRevenuePerUser: 0
        };
      }

      if (isActive) acc[planId].activeSubscribers++;
      acc[planId].totalRevenue += sub.amount_pi || 0;
      if (isMonthly) acc[planId].monthlyRevenue += sub.amount_pi || 0;

      return acc;
    }, {} as Record<string, SubscriptionPlanStats>);

    // Calculate averages
    Object.values(planStats).forEach(plan => {
      plan.avgRevenuePerUser = plan.activeSubscribers > 0 ? plan.totalRevenue / plan.activeSubscribers : 0;
    });

    // Calculate revenue by plan
    const revenueByPlan = Object.values(planStats).map(plan => ({
      planId: plan.planId,
      planName: plan.planName,
      revenue: plan.totalRevenue,
      subscribers: plan.activeSubscribers
    }));

    // Calculate user growth (simplified)
    const userGrowth = users.reduce((acc, user) => {
      const date = new Date(user.created_at || '').toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { date, newUsers: 0, activeUsers: 0 };
      acc[date].newUsers++;
      return acc;
    }, {} as Record<string, UserGrowthData>);

    return {
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active' && new Date(s.end_date) > now).length,
      totalRevenue: payments.reduce((sum, p) => sum + (p.amount_pi || 0), 0),
      monthlyRevenue: payments
        .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
        .reduce((sum, p) => sum + (p.amount_pi || 0), 0),
      subscriptionPlans: Object.values(planStats),
      userGrowth: Object.values(userGrowth).slice(-30), // Last 30 days
      revenueByPlan
    };
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const handleRefresh = () => {
    loadAdminData();
  };

  const exportData = (type: 'users' | 'subscriptions' | 'revenue') => {
    // Implementation for data export
    toast({
      title: 'Export Started',
      description: `Exporting ${type} data...`,
    });
  };

  const getSubscriptionStatusBadge = (status: string, endDate: string) => {
    const isExpired = new Date(endDate) < new Date();
    
    if (status === 'active' && !isExpired) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else if (status === 'cancelled') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cancelled</Badge>;
    } else if (isExpired) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
        <BackgroundDecoration />
        <div className="text-center bg-white/90 shadow-xl p-8 w-full flex flex-col items-center justify-center">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-600 z-10 mx-auto" />
          <p className="text-purple-800 ml-4 text-xl z-10">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Admin access unlocked - always show dashboard
  // if (!isAdmin) {
  //   return null;
  // }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
      <BackgroundDecoration />
      <div className="bg-white/90 shadow-xl p-8 w-full max-w-7xl mx-auto relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div className="text-center mb-8">
          <ImageWithFallback 
            src="/flappy-logo.png" 
            alt="Flappy Pi Logo" 
            className="w-16 h-16 mb-4 drop-shadow-xl animate-bounce-slow" 
            lazy={true} 
          />
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700">Admin Dashboard</h1>
          <p className="text-lg text-blue-800">Comprehensive analytics and user management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-blue-600 mt-1">Registered users</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{stats?.activeSubscriptions || 0}</div>
                  <p className="text-xs text-green-600 mt-1">Premium users</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-purple-600 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">${stats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-orange-600 mt-1">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Plans Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Subscription Plans Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats?.subscriptionPlans.map((plan) => (
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => exportData('users')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.slice(0, 20).map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={user.avatar_url || '/default-avatar.png'} 
                                  alt="" 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.pi_user_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.subscription_status === 'active' ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.total_coins?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at || '').toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Subscription Management</h2>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => exportData('subscriptions')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
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
                      {subscriptions.slice(0, 20).map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subscription.pi_user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subscription.plan_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getSubscriptionStatusBadge(subscription.status, subscription.end_date)}
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
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Revenue Analytics</h2>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => exportData('revenue')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Revenue by Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue by Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats?.revenueByPlan.map((plan) => (
                    <Card key={plan.planId} className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{plan.planName}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Revenue:</span>
                          <span className="font-semibold text-green-600">${plan.revenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subscribers:</span>
                          <span className="font-semibold">{plan.subscribers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg per User:</span>
                          <span className="font-semibold">${(plan.revenue / plan.subscribers || 0).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${stats?.monthlyRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-gray-600">All time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 