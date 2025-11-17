import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  pi_user_id: string;
  username: string;
  role: 'admin' | 'moderator' | 'user';
  permissions: string[];
  created_at: string;
}

export class AdminService {
  private static instance: AdminService;
  private currentAdmin: AdminUser | null = null;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async verifyAdminStatus(userId: string): Promise<{ isAdmin: boolean; user?: AdminUser; error?: string }> {
    try {
      // For demo purposes, we'll use a simple check
      // In production, this should query your admin users table
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { isAdmin: false, error: 'User not authenticated' };
      }

      // Check if user exists in admin table (you'll need to create this table)
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('pi_user_id', user.id)
        .single();

      if (error || !adminUser) {
        // For demo purposes, allow access to specific test users
        const testAdminIds = [
          'test-admin-1',
          'test-admin-2',
          // Add your actual admin user IDs here
        ];

        if (testAdminIds.includes(user.id)) {
          this.currentAdmin = {
            id: user.id,
            pi_user_id: user.id,
            username: user.email || 'Admin User',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'manage_users', 'manage_subscriptions', 'view_analytics'],
            created_at: new Date().toISOString()
          };
          return { isAdmin: true, user: this.currentAdmin };
        }

        return { isAdmin: false, error: 'User not authorized as admin' };
      }

      this.currentAdmin = adminUser;
      return { isAdmin: true, user: adminUser };
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return { isAdmin: false, error: 'Failed to verify admin status' };
    }
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    return this.currentAdmin;
  }

  async hasPermission(permission: string): Promise<boolean> {
    if (!this.currentAdmin) {
      return false;
    }

    return this.currentAdmin.permissions.includes(permission) || 
           this.currentAdmin.role === 'admin';
  }

  async canManageUsers(): Promise<boolean> {
    return this.hasPermission('manage_users');
  }

  async canManageSubscriptions(): Promise<boolean> {
    return this.hasPermission('manage_subscriptions');
  }

  async canViewAnalytics(): Promise<boolean> {
    return this.hasPermission('view_analytics');
  }

  async canDeleteData(): Promise<boolean> {
    return this.hasPermission('delete');
  }

  // Admin user management
  async addAdminUser(userData: Omit<AdminUser, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding admin user:', error);
      return { success: false, error: 'Failed to add admin user' };
    }
  }

  async removeAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('pi_user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing admin user:', error);
      return { success: false, error: 'Failed to remove admin user' };
    }
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }

  // Log admin actions for audit trail
  async logAdminAction(action: string, details: any): Promise<void> {
    try {
      await supabase
        .from('admin_audit_log')
        .insert([{
          admin_user_id: this.currentAdmin?.id,
          action,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }
}

export const adminService = AdminService.getInstance(); 