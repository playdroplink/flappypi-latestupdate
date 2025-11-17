import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Crown,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface RevenueAnalyticsPanelProps {
  onRefresh?: () => void;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  revenueByPlan: PlanRevenue[];
  revenueByPeriod: PeriodRevenue[];
  topRevenueUsers: UserRevenue[];
  revenueGrowth: number;
  subscriptionRevenue: number;
  inAppPurchaseRevenue: number;
}

interface PlanRevenue {
  planId: string;
  planName: string;
  revenue: number;
  subscribers: number;
  percentage: number;
}

interface PeriodRevenue {
  period: string;
  revenue: number;
  subscriptions: number;
  users: number;
}

interface UserRevenue {
  userId: string;
  username: string;
  totalSpent: number;
  subscriptions: number;
  lastPurchase: string;
}

const RevenueAnalyticsPanel: React.FC<RevenueAnalyticsPanelProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlan, setSelectedPlan] = useState('all');

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Load payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_status', 'completed');

      if (paymentsError) throw paymentsError;

      // Load subscriptions
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*');

      if (usersError) throw usersError;

      // Calculate revenue data
      const calculatedData = calculateRevenueData(paymentsData || [], subscriptionsData || [], usersData || []);
      setRevenueData(calculatedData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueData = (
    payments: any[],
    subscriptions: Tables<'subscriptions'>[],
    users: Tables<'user_profiles'>[]
  ): RevenueData => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount_pi || 0), 0);
    
    // Calculate period revenues
    const monthlyRevenue = payments
      .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + (p.amount_pi || 0), 0);
    
    const weeklyRevenue = payments
      .filter(p => new Date(p.created_at) >= sevenDaysAgo)
      .reduce((sum, p) => sum + (p.amount_pi || 0), 0);
    
    const dailyRevenue = payments
      .filter(p => new Date(p.created_at) >= oneDayAgo)
      .reduce((sum, p) => sum + (p.amount_pi || 0), 0);

    // Calculate revenue by plan
    const planRevenueMap = subscriptions.reduce((acc, sub) => {
      const planId = sub.plan_id;
      if (!acc[planId]) {
        acc[planId] = {
          planId,
          planName: sub.plan_name,
          revenue: 0,
          subscribers: 0,
          percentage: 0
        };
      }
      acc[planId].revenue += sub.amount_pi || 0;
      acc[planId].subscribers++;
      return acc;
    }, {} as Record<string, PlanRevenue>);

    // Calculate percentages
    Object.values(planRevenueMap).forEach(plan => {
      plan.percentage = totalRevenue > 0 ? (plan.revenue / totalRevenue) * 100 : 0;
    });

    // Calculate revenue by period (last 12 months)
    const revenueByPeriod: PeriodRevenue[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      const monthSubscriptions = subscriptions.filter(s => {
        const subDate = new Date(s.created_at);
        return subDate >= monthStart && subDate <= monthEnd;
      });

      revenueByPeriod.push({
        period: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, p) => sum + (p.amount_pi || 0), 0),
        subscriptions: monthSubscriptions.length,
        users: monthSubscriptions.length // Simplified
      });
    }

    // Calculate top revenue users
    const userRevenueMap = payments.reduce((acc, payment) => {
      const userId = payment.pi_user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          username: users.find(u => u.pi_user_id === userId)?.username || userId,
          totalSpent: 0,
          subscriptions: 0,
          lastPurchase: payment.created_at
        };
      }
      acc[userId].totalSpent += payment.amount_pi || 0;
      acc[userId].subscriptions++;
      return acc;
    }, {} as Record<string, UserRevenue>);

    const topRevenueUsers = Object.values(userRevenueMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Calculate revenue growth (simplified)
    const previousMonthRevenue = revenueByPeriod[revenueByPeriod.length - 2]?.revenue || 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Separate subscription and in-app purchase revenue
    const subscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.amount_pi || 0), 0);
    const inAppPurchaseRevenue = totalRevenue - subscriptionRevenue;

    return {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      revenueByPlan: Object.values(planRevenueMap),
      revenueByPeriod,
      topRevenueUsers,
      revenueGrowth,
      subscriptionRevenue,
      inAppPurchaseRevenue
    };
  };

  const exportRevenueData = () => {
    if (!revenueData) return;

    const csvContent = [
      ['Period', 'Revenue', 'Subscriptions', 'Users'],
      ...revenueData.revenueByPeriod.map(period => [
        period.period,
        period.revenue.toFixed(2),
        period.subscriptions.toString(),
        period.users.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Revenue data has been exported successfully.',
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading revenue analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!revenueData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <span>No revenue data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">${revenueData.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-900">${revenueData.monthlyRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(revenueData.revenueGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(revenueData.revenueGrowth)}`}>
                    {revenueData.revenueGrowth > 0 ? '+' : ''}{revenueData.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-purple-900">${revenueData.weeklyRevenue.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-orange-900">${revenueData.dailyRevenue.toFixed(2)}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.revenueByPlan.map((plan) => (
                <div key={plan.planId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">{plan.planName}</p>
                      <p className="text-sm text-gray-500">{plan.subscribers} subscribers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${plan.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{plan.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Subscription Revenue</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${revenueData.subscriptionRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {revenueData.totalRevenue > 0 ? ((revenueData.subscriptionRevenue / revenueData.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">In-App Purchases</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${revenueData.inAppPurchaseRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {revenueData.totalRevenue > 0 ? ((revenueData.inAppPurchaseRevenue / revenueData.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Timeline (Last 12 Months)
            </span>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadRevenueData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportRevenueData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.revenueByPeriod.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">{period.period}</div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{period.users} users</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Subscriptions</p>
                    <p className="font-semibold">{period.subscriptions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-semibold text-green-600">${period.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top Revenue Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.topRevenueUsers.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.subscriptions} subscriptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${user.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    Last: {new Date(user.lastPurchase).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Monthly Growth</p>
              <p className={`text-2xl font-bold ${getGrowthColor(revenueData.revenueGrowth)}`}>
                {revenueData.revenueGrowth > 0 ? '+' : ''}{revenueData.revenueGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Avg Revenue per User</p>
              <p className="text-2xl font-bold text-blue-900">
                ${revenueData.totalRevenue > 0 ? (revenueData.totalRevenue / revenueData.topRevenueUsers.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-900">
                {revenueData.revenueByPlan.length > 0 ? 
                  (revenueData.revenueByPlan.reduce((sum, p) => sum + p.subscribers, 0) / revenueData.topRevenueUsers.length * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueAnalyticsPanel; 