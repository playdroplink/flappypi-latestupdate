import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, DollarSign, BarChart, Settings, Send, ArrowLeft, Crown, TrendingUp } from 'lucide-react';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import ImageWithFallback from '@/components/ImageWithFallback';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import SubscriptionManagementPanel from '../components/admin/SubscriptionManagementPanel';
import RevenueAnalyticsPanel from '../components/admin/RevenueAnalyticsPanel';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Assuming useAuth or a similar hook provides user and authLoading states
      // For this example, I'll use placeholders that would need to be replaced with actual auth context.
      // For now, if no actual auth is implemented, this will default to non-admin.
      const user = { id: 'mock-user-id' }; // Replace with actual user from auth context
      const authLoading = false; // Replace with actual auth loading state

      if (authLoading) return;

      if (!user) {
        toast({
          title: 'Unauthorized',
          description: 'You must be logged in to access the admin portal.',
          variant: 'destructive',
          duration: 3000,
        });
        navigate('/home');
        return;
      }

      setLoading(true);
      try {
        // Replace with your actual Supabase client import and usage
        // Example: import { supabase } from '@/lib/supabaseClient';
        // const { data, error } = await supabase.functions.invoke('verify-admin-role', {
        //   body: { userId: user.id },
        //   headers: { Authorization: `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}` },
        // });
        // For now, simulate backend response if Supabase is not set up
        const simulatedAdminCheck = await new Promise(resolve => setTimeout(() => resolve({ data: { message: 'Admin verified' }, error: null }), 1000));
        const { data, error } = simulatedAdminCheck as any;

        if (error || !data || data.error) {
          console.error('Admin verification failed:', error?.message || data?.error);
          setIsAdmin(false);
          toast({
            title: 'Access Denied',
            description: 'You do not have administrative privileges.',
            variant: 'destructive',
            duration: 3000,
          });
          navigate('/home');
        } else {
          setIsAdmin(true);
          console.log('Admin verified:', data.message);
        }
      } catch (err) {
        console.error('Error during admin verification:', err);
        setIsAdmin(false);
        toast({
          title: 'Error',
          description: 'Failed to verify admin status.',
          variant: 'destructive',
          duration: 3000,
        });
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
        <BackgroundDecoration />
          <div className="text-center bg-white/90 shadow-xl p-8 w-full flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 z-10 mx-auto" />
            <p className="text-purple-800 ml-4 text-xl z-10">Loading Admin Portal...</p>
          </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Should have been redirected by now, but as a fallback
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
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
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Admin Portal</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Manage the Flappy Pi app and user data.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {/* Overview */}
          <Card className="bg-blue-100/70 backdrop-blur-sm border-blue-200 shadow-xl text-blue-900 cursor-pointer hover:bg-blue-200/70 transition-colors" onClick={() => navigate('/admin/dashboard')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold"><BarChart className="mr-2" /> Detailed Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Comprehensive dashboard with key metrics and analytics.</p>
              <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">View Dashboard</Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-green-100/70 backdrop-blur-sm border-green-200 shadow-xl text-green-900 cursor-pointer hover:bg-green-200/70 transition-colors" onClick={() => handleSectionChange('users')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold"><Users className="mr-2" /> User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Manage users, track subscriptions, and view user analytics.</p>
              <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white">Manage Users</Button>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card className="bg-purple-100/70 backdrop-blur-sm border-purple-200 shadow-xl text-purple-900 cursor-pointer hover:bg-purple-200/70 transition-colors" onClick={() => handleSectionChange('subscriptions')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold"><Crown className="mr-2" /> Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Track subscription plans, revenue, and manage user subscriptions.</p>
              <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white">Manage Subscriptions</Button>
            </CardContent>
          </Card>

          {/* Revenue Analytics */}
          <Card className="bg-orange-100/70 backdrop-blur-sm border-orange-200 shadow-xl text-orange-900 cursor-pointer hover:bg-orange-200/70 transition-colors" onClick={() => handleSectionChange('revenue')}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold"><TrendingUp className="mr-2" /> Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Detailed revenue tracking, charts, and financial insights.</p>
              <Button className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white">View Analytics</Button>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Content Section */}
        {activeSection !== 'overview' && (
          <div className="mt-8">
            {activeSection === 'users' && (
              <UserManagementPanel onRefresh={() => {}} />
            )}
            {activeSection === 'subscriptions' && (
              <SubscriptionManagementPanel onRefresh={() => {}} />
            )}
            {activeSection === 'revenue' && (
              <RevenueAnalyticsPanel onRefresh={() => {}} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 