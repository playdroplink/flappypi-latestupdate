import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Globe, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState(7); // Default to 7 days
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data fetching based on dateRange
        // const mockData = generateMockAnalyticsData(dateRange);
        // setAnalyticsData(mockData);
      } catch (err) {
        setError("Failed to load analytics data.");
        console.error("Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // const generateMockAnalyticsData = (days: number) => {
  //   const data = {
  //     totalUsers: Math.floor(Math.random() * 10000) + 5000,
  //     activeUsers: Math.floor(Math.random() * 3000) + 1000,
  //     revenue: parseFloat((Math.random() * 500 + 100).toFixed(2)),
  //     newSignups: Math.floor(Math.random() * 200) + 50,
  //     userRetention: parseFloat((Math.random() * 20 + 70).toFixed(2)), // 70-90%

  //     // Daily data for charts
  //     dailyUsers: [],
  //     dailyRevenue: [],
  //     dailyNewSignups: [],
  //   };

  //   for (let i = 0; i < days; i++) {
  //     const date = new Date();
  //     date.setDate(date.getDate() - i);
  //     const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

  //     data.dailyUsers.unshift({
  //       date: formattedDate,
  //       users: Math.floor(Math.random() * 500) + 100,
  //     });
  //     data.dailyRevenue.unshift({
  //       date: formattedDate,
  //       revenue: parseFloat((Math.random() * 20 + 5).toFixed(2)),
  //     });
  //     data.dailyNewSignups.unshift({
  //       date: formattedDate,
  //       signups: Math.floor(Math.random() * 10) + 1,
  //     });
  //   }

  //   return data;
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No analytics data available.</p>
      </div>
    );
  }

  const pieChartData = [
    { name: 'Active', value: analyticsData.activeUsers },
    { name: 'Inactive', value: analyticsData.totalUsers - analyticsData.activeUsers },
  ];
  const COLORS = ['#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6 p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Game Analytics Dashboard</h2>

      <div className="flex justify-center space-x-2 mb-6">
        <Button
          variant={dateRange === 7 ? 'default' : 'outline'}
          onClick={() => setDateRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={dateRange === 30 ? 'default' : 'outline'}
          onClick={() => setDateRange(30)}
        >
          30 Days
        </Button>
        <Button
          variant={dateRange === 90 ? 'default' : 'outline'}
          onClick={() => setDateRange(90)}
        >
          90 Days
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{analyticsData.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+15.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.newSignups.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+8.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">User Retention</CardTitle>
            <Globe className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userRetention}%</div>
            <p className="text-xs text-gray-500">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.dailyUsers}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dailyRevenue}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Daily New Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dailyNewSignups}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="signups" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>User Retention Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button onClick={() => setDateRange(7)} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
