# 🏛️ Flappy Pi Admin Portal

A comprehensive admin portal for managing users, subscriptions, and revenue analytics for the Flappy Pi game.

## 🚀 Features

### 📊 Dashboard Overview
- **Real-time Analytics**: View key metrics including total users, active subscriptions, and revenue
- **Interactive Charts**: Visual representation of user growth and revenue trends
- **Quick Actions**: Easy access to all admin functions

### 👥 User Management
- **User Search & Filter**: Find users by username, Pi ID, or subscription status
- **User Details**: View comprehensive user information including payment history
- **User Actions**: Suspend, activate, or manage user accounts
- **Export Functionality**: Download user data as CSV files

### 👑 Subscription Management
- **Plan Performance**: Track subscription plan metrics and revenue
- **Subscription Status**: Monitor active, cancelled, and expired subscriptions
- **Revenue Analytics**: Detailed breakdown of revenue by plan
- **Subscription Actions**: Cancel, reactivate, or extend subscriptions

### 💰 Revenue Analytics
- **Revenue Tracking**: Monitor daily, weekly, monthly, and total revenue
- **Growth Metrics**: Track revenue growth and conversion rates
- **Top Revenue Users**: Identify highest-spending users
- **Revenue Breakdown**: Separate subscription and in-app purchase revenue

## 🛠️ Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary admin tables:

```sql
-- Execute admin-setup.sql in your Supabase SQL editor
```

This will create:
- `admin_users` table for admin user management
- `admin_audit_log` table for action tracking
- Database views for analytics
- Helper functions for admin operations

### 2. Admin User Configuration

Add your admin users to the database:

```sql
INSERT INTO admin_users (pi_user_id, username, role, permissions) 
VALUES (
    'your-pi-user-id', 
    'Admin User', 
    'admin', 
    '["read", "write", "delete", "manage_users", "manage_subscriptions", "view_analytics"]'
);
```

### 3. Environment Configuration

Ensure your Supabase configuration is properly set up in `src/integrations/supabase/client.ts`.

## 📱 Usage

### Accessing the Admin Portal

1. Navigate to `/admin` in your application
2. The system will verify your admin status
3. Access the detailed dashboard at `/admin/dashboard`

### Admin Portal Sections

#### 🏠 Overview Dashboard
- **Key Metrics**: Total users, active subscriptions, revenue
- **Plan Performance**: Revenue breakdown by subscription plan
- **Quick Actions**: Navigate to different admin sections

#### 👥 User Management
- **Search & Filter**: Find specific users or filter by status
- **User Table**: View user details, subscription status, and revenue
- **User Actions**: View detailed user information, manage accounts
- **Export Data**: Download user information as CSV

#### 👑 Subscription Management
- **Plan Analytics**: Performance metrics for each subscription plan
- **Subscription Table**: Manage individual subscriptions
- **Revenue Tracking**: Monitor subscription revenue and growth
- **Subscription Actions**: Cancel, reactivate, or extend subscriptions

#### 💰 Revenue Analytics
- **Revenue Overview**: Daily, weekly, monthly, and total revenue
- **Revenue Breakdown**: Subscription vs in-app purchase revenue
- **Revenue Timeline**: Historical revenue data
- **Top Users**: Highest revenue-generating users
- **Growth Insights**: Revenue growth and conversion metrics

## 🔐 Security Features

### Admin Authentication
- **Role-based Access**: Different permission levels (admin, moderator, user)
- **Permission System**: Granular permissions for different admin functions
- **Audit Logging**: All admin actions are logged for security

### Data Protection
- **Secure Routes**: Admin routes are protected and require authentication
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error handling and user feedback

## 📊 Analytics & Reporting

### Key Metrics Tracked
- **User Metrics**: Total users, active users, user growth
- **Subscription Metrics**: Active subscriptions, plan performance, churn rate
- **Revenue Metrics**: Total revenue, monthly revenue, revenue growth
- **Conversion Metrics**: Subscription conversion rates, average revenue per user

### Export Capabilities
- **CSV Export**: Export user data, subscription data, and revenue data
- **Filtered Exports**: Export data based on search and filter criteria
- **Date Range Exports**: Export data for specific time periods

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-friendly**: Optimized for all screen sizes
- **Modern UI**: Clean, professional interface using shadcn/ui components
- **Interactive Elements**: Hover effects, loading states, and smooth transitions

### User Experience
- **Intuitive Navigation**: Easy-to-use interface with clear sections
- **Real-time Updates**: Live data updates and refresh capabilities
- **Search & Filter**: Powerful search and filtering options
- **Pagination**: Efficient handling of large datasets

## 🔧 Technical Implementation

### Components Structure
```
src/
├── pages/
│   ├── AdminPage.tsx              # Main admin portal
│   └── AdminDashboard.tsx         # Detailed dashboard
├── components/
│   └── admin/
│       ├── UserManagementPanel.tsx
│       ├── SubscriptionManagementPanel.tsx
│       └── RevenueAnalyticsPanel.tsx
└── services/
    └── adminService.ts            # Admin service layer
```

### Key Technologies
- **React**: Frontend framework
- **TypeScript**: Type safety
- **Supabase**: Database and authentication
- **shadcn/ui**: UI components
- **Lucide React**: Icons
- **React Router**: Navigation

## 📈 Monitoring & Analytics

### Admin Audit Trail
- **Action Logging**: All admin actions are logged with timestamps
- **User Tracking**: Track which admin performed which actions
- **IP Address Logging**: Security monitoring for admin access

### Performance Monitoring
- **Database Optimization**: Indexed queries for fast performance
- **Caching**: Efficient data loading and caching
- **Error Monitoring**: Comprehensive error tracking and reporting

## 🚀 Deployment

### Production Considerations
1. **Security**: Ensure admin routes are properly protected
2. **Performance**: Monitor database query performance
3. **Backup**: Regular database backups for admin data
4. **Monitoring**: Set up monitoring for admin portal usage

### Environment Variables
Ensure these are properly configured:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `ADMIN_USER_IDS`: Comma-separated list of admin user IDs (optional)

## 🐛 Troubleshooting

### Common Issues

1. **Admin Access Denied**
   - Verify user is in admin_users table
   - Check user permissions
   - Ensure proper authentication

2. **Data Not Loading**
   - Check Supabase connection
   - Verify database tables exist
   - Check browser console for errors

3. **Export Issues**
   - Ensure browser allows downloads
   - Check data format and size
   - Verify CSV generation logic

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('admin-debug', 'true');
```

## 📝 API Reference

### Admin Service Methods
```typescript
// Verify admin status
adminService.verifyAdminStatus(userId: string)

// Check permissions
adminService.hasPermission(permission: string)

// Log admin actions
adminService.logAdminAction(action: string, details: any)
```

### Database Views
- `admin_dashboard_stats`: Aggregated dashboard statistics
- `user_subscription_analytics`: User and subscription data
- `revenue_analytics`: Monthly revenue analytics

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow existing TypeScript and React patterns
2. **Testing**: Add tests for new admin functionality
3. **Documentation**: Update this README for new features
4. **Security**: Ensure all admin functions are properly secured

### Adding New Features
1. Create new components in `src/components/admin/`
2. Add routes in `src/constants/routes.ts`
3. Update admin service for new functionality
4. Add database views/tables if needed
5. Update documentation

## 📞 Support

For admin portal support:
1. Check the troubleshooting section
2. Review database setup
3. Verify admin user configuration
4. Check browser console for errors

## 📄 License

This admin portal is part of the Flappy Pi project and follows the same licensing terms.

---

**Note**: This admin portal is designed for production use with proper security measures. Always ensure admin access is properly restricted and monitored. 