# Pi Browser Authentication System

## Overview

Flappy Pi now requires Pi Browser authentication for all pages. This ensures that only authenticated users in Pi Browser can access the game and its features.

## Key Components

### 1. PiAuthGuard Component (`src/components/PiAuthGuard.tsx`)

The main authentication guard that:
- Checks if the user is in Pi Browser or PiNet environment
- Verifies authentication status
- Shows appropriate login prompts or blocks access
- Redirects unauthenticated users to the login page

**Features:**
- Environment detection (Pi Browser, PiNet, regular browser)
- Authentication status checking
- User-friendly login prompts
- Automatic redirects

### 2. PiBrowserLoginPage (`src/pages/PiBrowserLoginPage.tsx`)

A dedicated login page that:
- Handles Pi Network authentication
- Shows environment status
- Provides download links for Pi Browser
- Manages authentication flow

**Features:**
- Pi SDK integration
- Environment status display
- Error handling
- Automatic navigation after login

### 3. LogoutButton Component (`src/components/LogoutButton.tsx`)

A reusable logout button that:
- Integrates with the authentication context
- Provides confirmation dialog
- Supports different styling variants
- Shows username when configured

**Features:**
- Multiple styling variants (default, outline, destructive)
- Different sizes (sm, md, lg)
- Optional username display
- Confirmation dialog

## Authentication Flow

### 1. Initial Access
1. User visits any page
2. PiAuthGuard checks environment and authentication
3. If not in Pi Browser: Shows download prompt
4. If in Pi Browser but not authenticated: Shows login page
5. If authenticated: Allows access to the page

### 2. Login Process
1. User clicks "Sign in with Pi" on login page
2. Pi SDK authenticates with Pi Network
3. User data is stored in localStorage
4. User is redirected to intended destination
5. Authentication state is updated throughout the app

### 3. Logout Process
1. User clicks logout button
2. Confirmation dialog appears
3. If confirmed: Clears authentication data
4. User is redirected to home page
5. Authentication state is reset

## Route Protection

### Protected Routes
All routes except `/pi-browser-login` are protected by PiAuthGuard:

```typescript
<Routes>
  {/* Public Login Route - No Authentication Required */}
  <Route path="/pi-browser-login" element={<PiBrowserLoginPage />} />
  
  {/* All Other Routes - Protected by PiAuthGuard */}
  <Route path="*" element={
    <PiAuthGuard>
      <Routes>
        {/* All app routes go here */}
      </Routes>
    </PiAuthGuard>
  } />
</Routes>
```

### Public Routes
- `/pi-browser-login` - Login page (no authentication required)

### Protected Routes
- All other routes require Pi Browser authentication

## Environment Detection

The system detects different environments:

### Pi Browser
- Full Pi SDK available
- Native Pi Network features
- Secure authentication

### PiNet
- PiNet ecosystem detected
- Limited Pi SDK features
- Requires Pi Browser for full functionality

### Regular Browser
- No Pi SDK available
- Shows download prompt
- Cannot access protected features

## User Experience

### For Pi Browser Users
1. Seamless authentication
2. Full access to all features
3. Native Pi Network integration
4. Automatic login persistence

### For Non-Pi Browser Users
1. Clear download instructions
2. Explanation of benefits
3. Easy access to Pi Browser download
4. Refresh option after installation

## Benefits

### Security
- Ensures only Pi Network users can access the game
- Prevents unauthorized access
- Secure authentication flow

### User Experience
- Clear authentication requirements
- Helpful download instructions
- Smooth login process
- Persistent authentication

### Pi Network Integration
- Native Pi Network features
- Pi cryptocurrency payments
- Rewarded ads
- Enhanced mobile experience

## Implementation Details

### Authentication Context
Uses the existing `AuthContext` with enhanced Pi authentication:

```typescript
const { isAuthenticated, isPiAuth, piUser, loginWithPi, logout } = useAuth();
```

### Local Storage
Stores authentication data in localStorage:
- `flappypi-username` - Username
- `flappypi-pi-user` - Pi user data
- `flappypi-pi-auth` - Authentication status

### Pi SDK Integration
Leverages the Pi JavaScript SDK for:
- User authentication
- Payment processing
- Ad integration
- Native features

## Usage Examples

### Adding Logout Button to Pages
```typescript
import LogoutButton from '../components/LogoutButton';

// In your component
<LogoutButton 
  variant="outline" 
  size="md" 
  showUsername={true} 
/>
```

### Checking Authentication Status
```typescript
import { useAuth } from '../context/AuthContext';

const { isAuthenticated, isPiAuth, piUser } = useAuth();

if (isAuthenticated && isPiAuth) {
  // User is authenticated with Pi
}
```

## Error Handling

### Authentication Errors
- Clear error messages
- Retry options
- Fallback to download prompt

### Environment Errors
- Browser detection issues
- SDK loading problems
- Network connectivity issues

### User Feedback
- Loading states
- Success confirmations
- Error notifications

## Future Enhancements

### Planned Features
- Multi-factor authentication
- Session management
- Offline mode support
- Enhanced security measures

### Potential Improvements
- Biometric authentication
- Social login options
- Advanced user profiles
- Cross-device synchronization

## Troubleshooting

### Common Issues
1. **Pi SDK not loading**: Check network connection and Pi Browser installation
2. **Authentication failing**: Verify Pi Network account status
3. **Environment detection issues**: Clear browser cache and restart Pi Browser
4. **Login persistence problems**: Check localStorage permissions

### Debug Information
The system provides detailed console logging for debugging:
- Environment detection results
- Authentication status changes
- Error details
- User flow tracking

## Conclusion

The Pi Browser authentication system ensures that Flappy Pi is only accessible to authenticated Pi Network users, providing a secure and integrated gaming experience within the Pi ecosystem.
