import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Crown, 
  Coins, 
  Calendar,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface UserManagementPanelProps {
  onRefresh?: () => void;
}

interface UserWithDetails extends Tables<'user_profiles'> {
  subscription?: Tables<'subscriptions'>;
  paymentHistory?: any[];
  gameStats?: any;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, planFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load users with their profiles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Load subscriptions for each user
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Load payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_status', 'completed');

      if (paymentsError) throw paymentsError;

      // Combine data
      const usersWithDetails = (usersData || []).map(user => {
        const userSubscriptions = (subscriptionsData || []).filter(
          sub => sub.pi_user_id === user.pi_user_id
        );
        const userPayments = (paymentsData || []).filter(
          payment => payment.pi_user_id === user.pi_user_id
        );
        
        return {
          ...user,
          subscription: userSubscriptions.find(sub => sub.status === 'active'),
          paymentHistory: userPayments,
          gameStats: {
            totalSpent: userPayments.reduce((sum, p) => sum + (p.amount_pi || 0), 0),
            totalPayments: userPayments.length
          }
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.pi_user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') {
          return user.subscription_status === 'active';
        } else if (statusFilter === 'inactive') {
          return user.subscription_status !== 'active';
        } else if (statusFilter === 'premium') {
          return user.subscription?.status === 'active';
        }
        return true;
      });
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.subscription?.plan_id === planFilter
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'suspend':
          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'suspended' })
            .eq('id', userId);
          break;
        case 'activate':
          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'active' })
            .eq('id', userId);
          break;
        case 'delete':
          // Implement soft delete or actual deletion logic
          toast({
            title: 'User Deleted',
            description: 'User has been removed from the system.',
          });
          break;
      }
      
      loadUsers();
      onRefresh?.();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform action.',
        variant: 'destructive',
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Pi User ID', 'Subscription Status', 'Plan', 'Total Coins', 'Total Spent', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.username || '',
        user.pi_user_id,
        user.subscription_status || '',
        user.subscription?.plan_name || '',
        user.total_coins?.toString() || '0',
        user.gameStats?.totalSpent?.toFixed(2) || '0',
        new Date(user.created_at || '').toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'User data has been exported successfully.',
    });
  };

  const getSubscriptionStatusBadge = (user: UserWithDetails) => {
    if (user.subscription?.status === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Premium Active</Badge>;
    } else if (user.subscription_status === 'active') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Basic Active</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading users...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(u => u.subscription_status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Premium Users</p>
                <p className="text-2xl font-bold text-purple-900">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${users.reduce((sum, u) => sum + (u.gameStats?.totalSpent || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            <div className="flex gap-2">
              <Button onClick={loadUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
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
                  placeholder="Search users by username or Pi ID..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="ad_free">Ad-Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
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
                      {getSubscriptionStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.subscription?.plan_name || 'No Plan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.total_coins?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${user.gameStats?.totalSpent?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Username</label>
                                    <p className="text-sm">{selectedUser.username}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Pi User ID</label>
                                    <p className="text-sm">{selectedUser.pi_user_id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Total Coins</label>
                                    <p className="text-sm">{selectedUser.total_coins?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Total Spent</label>
                                    <p className="text-sm">${selectedUser.gameStats?.totalSpent?.toFixed(2) || '0.00'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Subscription Status</label>
                                    <p className="text-sm">{selectedUser.subscription_status || 'None'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Current Plan</label>
                                    <p className="text-sm">{selectedUser.subscription?.plan_name || 'No Plan'}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Payment History</label>
                                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                    {selectedUser.paymentHistory?.map((payment, index) => (
                                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                        <span>{payment.item_name}</span>
                                        <span>${payment.amount_pi?.toFixed(2) || '0.00'}</span>
                                      </div>
                                    ))}
                                    {(!selectedUser.paymentHistory || selectedUser.paymentHistory.length === 0) && (
                                      <p className="text-sm text-gray-500">No payment history</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          <UserX className="h-4 w-4" />
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
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} results
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

export default UserManagementPanel; 