# Profile Sync System - Real-time Updates

## Overview
The profile synchronization system enables real-time updates of user profile data across multiple UI components using React Context and custom events.

## Architecture

### Components
1. **useUserProfile Hook** - Central profile state management
   - Location: `src/hooks/useUserProfile.tsx`
   - Manages profile state, updates, and persistence

2. **ProfilePage** - User profile editing interface
   - Location: `src/pages/ProfilePage.tsx`
   - Allows users to save avatar and other profile data

3. **ProfileImageModal** - Profile display modal
   - Location: `src/components/ProfileImageModal.tsx`
   - Shows current profile in HomePage
   - Automatically updates when profile changes

4. **HomePage** - Main game hub
   - Location: `src/pages/HomePage.tsx`
   - Displays profile modal and user information

## Update Flow

```
ProfilePage (handleSaveAvatar)
    ↓
updateProfile() [useUserProfile]
    ↓
1. Update Context State (setProfile)
2. Update localStorage
3. Dispatch 'profile-updated' event
    ↓
ProfileImageModal [listening]
    ↓
Refresh Display (setProfileImage, setUsername)
```

## Key Features

### 1. Context-Based State Management
```typescript
// In useUserProfile hook
const updateProfile = async (updates: Partial<UserProfile>) => {
  // Update state
  setProfile(updatedProfile);
  
  // Persist to localStorage
  localStorage.setItem('flappypi-profile', JSON.stringify(updatedProfile));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('profile-updated', {
    detail: {
      profile: updatedProfile,
      timestamp: new Date().getTime()
    }
  }));
};
```

### 2. Event Listener System
```typescript
// In ProfileImageModal
useEffect(() => {
  const handleProfileUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    
    // Update local state immediately
    setProfileImage(getCurrentProfileImage());
    setUsername(getCurrentUsername());
  };
  
  window.addEventListener('profile-updated', handleProfileUpdate);
  
  return () => {
    window.removeEventListener('profile-updated', handleProfileUpdate);
  };
}, [isOpen, profile?.selected_bird_skin, profile?.avatar_url]);
```

### 3. Multiple Update Triggers
Updates are triggered by:
- **Direct profile updates** from ProfilePage via `updateProfile()`
- **Avatar changes** with explicit event dispatch
- **Wallet updates** with automatic context refresh
- **User authentication** with initial profile load

## Data Persistence

### localStorage Strategy
- **Key**: `flappypi-profile` (JSON stringified profile object)
- **Purpose**: Instant fallback if context state resets
- **Updated**: Every time profile is updated
- **Lifetime**: Persists until user logs out

### Context State
- **Type**: React Context via useUserProfile hook
- **Scope**: Global across app
- **Updated**: Via updateProfile() method
- **Synced**: With localStorage and Supabase

## Synchronization Guarantees

### Immediate Updates
1. Context state updates synchronously
2. Event listeners trigger immediately
3. UI components re-render in real-time
4. No page reload required

### Persistence
1. Data saved to localStorage instantly
2. Data synced to Supabase asynchronously
3. Fallback to localStorage if sync fails
4. Data recoverable on page reload

### Cross-Component Sync
1. ProfileImageModal listens to profile-updated event
2. HomePage components access profile via useUserProfile hook
3. Multiple listeners can be active simultaneously
4. Event propagation is automatic

## Common Update Scenarios

### Scenario 1: User Changes Avatar
```typescript
// In ProfilePage.tsx
const handleSaveAvatar = async () => {
  // Step 1: Save to localStorage
  localStorage.setItem('flappypi-avatar', avatar);
  
  // Step 2: Call updateProfile (triggers event)
  await updateProfile({ avatar_url: avatarUrl });
  
  // Step 3: Dispatch additional event for ProfilePage-specific updates
  window.dispatchEvent(new CustomEvent('profile-updated', {
    detail: { profile: updatedProfile, source: 'ProfilePage' }
  }));
};
```

### Scenario 2: Profile Modal Opens
```typescript
// In ProfileImageModal.tsx
useEffect(() => {
  if (!isOpen) return;
  
  // Fetch current profile from context (always up-to-date)
  const image = getCurrentProfileImage();
  const username = getCurrentUsername();
  
  setProfileImage(image);
  setUsername(username);
}, [isOpen, profile]);
```

### Scenario 3: User Authenticates
```typescript
// In useUserProfile hook
const initializeProfile = async (userId?: string) => {
  // Load profile from backend/localStorage
  const profile = await getProfile(userId);
  
  // Update context
  setProfile(profile);
  
  // Persist locally
  localStorage.setItem('flappypi-profile', JSON.stringify(profile));
};
```

## Event Details

### Profile-Updated Event
```typescript
window.dispatchEvent(new CustomEvent('profile-updated', {
  detail: {
    profile: UserProfile,          // Updated profile object
    timestamp: number,              // Event timestamp
    source?: 'ProfilePage' | ...    // Optional source identifier
  }
}));
```

### Event Listeners
```typescript
// Listen for profile updates
window.addEventListener('profile-updated', (event: Event) => {
  const { profile, timestamp } = (event as CustomEvent).detail;
  console.log('Profile updated:', profile);
});

// Cleanup on unmount
window.removeEventListener('profile-updated', handler);
```

## Debugging

### Enable Logging
All major operations log to console with emoji prefixes:
- `📝` - Profile updated
- `🔄` - Profile refreshed
- `💾` - Data persisted
- `⚠️` - Warning/sync issue

### Check localStorage
```javascript
// View saved profile
JSON.parse(localStorage.getItem('flappypi-profile'));

// View wallet
JSON.parse(localStorage.getItem('flappypi-wallet-*'));

// View auth status
localStorage.getItem('flappypi-pi-user');
```

### Verify Event Dispatch
```javascript
// Listen for all profile updates
window.addEventListener('profile-updated', (e) => {
  console.log('🔄 Profile event:', e.detail);
});
```

## Performance Considerations

### Optimization Patterns
1. **Event listeners only when modal is open** - Prevents unnecessary listeners
2. **Dependency arrays on useEffect** - Only re-run when data changes
3. **localStorage fallback** - No extra API calls if context state lost
4. **Batch updates** - Multiple changes in single updateProfile call

### Potential Issues
1. **Circular updates** - Avoided by checking source in event
2. **Race conditions** - Timestamp helps identify stale updates
3. **Memory leaks** - Event listeners properly cleaned up on unmount
4. **Sync failures** - localStorage fallback ensures data isn't lost

## Future Enhancements

### Planned Features
1. **Optimistic updates** - Show changes before server confirms
2. **Conflict resolution** - Handle simultaneous updates from multiple tabs
3. **Automatic sync** - Periodic refresh from server
4. **Update history** - Track all profile changes with timestamps
5. **Undo/Redo** - Ability to revert recent changes

### Integration Points
- Game state changes affecting profile
- Inventory updates affecting owned skins
- Subscription changes affecting premium status
- Reward claims affecting total coins

## Testing Profile Sync

### Manual Testing Steps
1. Open ProfilePage
2. Change avatar
3. Click "Save Avatar"
4. Return to HomePage
5. Click profile icon/image
6. Verify ProfileImageModal shows new avatar
7. Close and reopen modal - data should persist

### Verification
- Avatar image updated in modal
- Username displayed correctly
- Character info shows current selection
- "Live" status indicator active
- Refresh button updates data

### Debugging Test
```javascript
// In console while on HomePage
// Step 1: Open profile modal
document.querySelector('[onclick*="showProfileModal"]').click();

// Step 2: Check current state
console.log('Current profile:', JSON.parse(localStorage.getItem('flappypi-profile')));

// Step 3: Go to ProfilePage and change avatar
// Step 4: Return to HomePage and check if modal updated automatically
```

## Related Systems

### Wallet Integration
- Similar event-based system
- Uses `wallet-auto-collected` event
- Same localStorage persistence pattern
- See `WALLET_SERVICE_COMPLETE.md`

### Authentication System
- Initial profile load on login
- Profile linked to Pi user ID
- Automatic context initialization
- See `AUTHENTICATION_SYSTEM_COMPLETE_SUMMARY.md`

### Game State Management
- Profile changes affect game behavior
- Subscription status impacts rewards
- Bird skin selection affects visuals
- Owned skins affect shop display

## Troubleshooting

### Modal Not Updating
1. Check console for `profile-updated` events
2. Verify profile context is initialized
3. Confirm modal is listening to events
4. Check localStorage for profile data

### Event Not Dispatching
1. Verify updateProfile was called
2. Check network tab for API calls
3. Confirm event listener is attached
4. Look for JavaScript errors in console

### Data Not Persisting
1. Check localStorage quota
2. Verify Supabase connection
3. Check browser's storage permissions
4. Look for sync errors in console

## API Reference

### useUserProfile Hook
```typescript
const { 
  profile,              // Current user profile object
  updateProfile,        // Async function to update profile
  refreshProfile,       // Manually refresh from server
  loading,              // Update in progress
  isAuthenticated       // User logged in
} = useUserProfile();

// Update profile
await updateProfile({ avatar_url: '/new-avatar.png' });

// Manual refresh
await refreshProfile();
```

### Custom Events
```typescript
// Subscribe to profile updates
window.addEventListener('profile-updated', handler);

// Dispatch profile update
window.dispatchEvent(new CustomEvent('profile-updated', { 
  detail: { profile, timestamp }
}));

// Cleanup
window.removeEventListener('profile-updated', handler);
```

## Summary

The profile sync system provides:
- ✅ Real-time updates across UI components
- ✅ Automatic persistence to localStorage
- ✅ Event-based architecture for flexibility
- ✅ Fallback mechanisms for reliability
- ✅ Seamless integration with Context API
- ✅ No page reload required for updates
- ✅ Extensible for future enhancements

This ensures that user profile changes made in ProfilePage immediately appear in HomePage's profile modal and persist across sessions.
