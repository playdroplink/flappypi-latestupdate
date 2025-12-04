# Profile Display Verification Guide

## Overview
This guide ensures the profile modal displays **exactly** what is set in the profile, without any mismatches.

## How to Test Profile Display

### Test 1: Verify Profile Data Loads on Modal Open
1. Navigate to HomePage
2. Open browser DevTools (F12)
3. Go to Console tab
4. Click on your profile icon/avatar
5. Look for console logs:
   ```
   📂 ProfileImageModal opened - loading profile data
   💾 Loaded profile from localStorage: {...}
   📝 ProfileImageModal updating display: {...}
   ```
6. Verify the logged profile data matches what you expect

### Test 2: Check Profile Persists Across Pages
1. Go to ProfilePage
2. Change your avatar/character
3. Click "Save Avatar"
4. Check console for:
   ```
   📝 Profile updated and event dispatched: {...}
   ```
5. Navigate back to HomePage
6. Open profile modal
7. ✅ Verify avatar/character matches what you saved

### Test 3: Real-time Update on Profile Change
1. Open HomePage in browser
2. Open profile modal (keep it open)
3. In another tab, go to ProfilePage
4. Change avatar
5. Click "Save Avatar"
6. Return to HomePage
7. ✅ Verify profile modal updates immediately WITHOUT needing to close/reopen

### Test 4: Profile Persistence After Page Reload
1. Go to ProfilePage
2. Change avatar to specific character
3. Click "Save Avatar"
4. Reload page (F5)
5. Click profile icon
6. ✅ Verify profile shows the same character after reload

## What Gets Displayed

### Avatar/Image Priority
```
1. Selected bird skin (profile.selected_bird_skin) → uses getBirdImageSrc()
2. Custom avatar_url (profile.avatar_url) → direct image path
3. Default (flappy-logo.png) → fallback if nothing set
```

### Username Priority
```
1. piUser.username (from AuthContext) → Pi authenticated user
2. localStorage 'flappypi-pi-user' → cached Pi user
3. localStorage 'pi_user' → Pi SDK cached user
4. window.Pi.currentUser() → direct Pi SDK access
5. getDisplayUsername() → fallback helper function
```

### Character Display
```
- Shows profile.selected_bird_skin with formatted name
- If no skin selected: shows "Default Character"
```

## Debug Information

### Console Logs to Check
- **📝 Profile updated** - Profile was changed
- **🔄 Profile refreshed** - Profile reloaded from server
- **💾 Loaded profile from localStorage** - Cached profile loaded
- **✅ ProfileImageModal updating** - Display updated with new data
- **🔄 ProfileImageModal received profile-updated event** - Event-based update triggered

### Verify Data in localStorage
Open DevTools → Application → Storage → Local Storage:

```javascript
// View saved profile
JSON.parse(localStorage.getItem('flappypi-profile'))

// Should show:
{
  pi_user_id: "...",
  username: "...",
  selected_bird_skin: "...",
  avatar_url: "...",
  // ... other fields
}
```

## Common Issues & Solutions

### Issue: Modal Shows "MockPiUser" Instead of Real Username
**Solution**: 
- Check if profile context is initialized: `profile` should not be null
- Check localStorage 'flappypi-profile' contains correct username
- Verify Pi authentication completed by checking `isPiAuth` flag

**Debug**:
```javascript
// In console, check:
console.log(JSON.parse(localStorage.getItem('flappypi-profile')));
// Should have your username, not "MockPiUser"
```

### Issue: Avatar Doesn't Update After Save
**Solution**:
- Check 'profile-updated' event is dispatching
- Verify modal is listening to event
- Check getBirdImageSrc() returns correct path

**Debug**:
```javascript
// In console, listen for updates:
window.addEventListener('profile-updated', (e) => {
  console.log('🔄 Profile event:', e.detail);
});
```

### Issue: Profile Shows Default After Reload
**Solution**:
- Verify profile saved to localStorage
- Check updateProfile() was called in useUserProfile hook
- Ensure event dispatch completed

**Debug**:
```javascript
// Check localStorage has profile
localStorage.getItem('flappypi-profile');
// Should contain profile data, not null

// Check if ProfileProvider initialized on mount
// (Look for "Loading profile from localStorage" in console)
```

## Exact Display Mapping

### What You Set → What's Displayed

| What You Do | Property Changed | Displayed In Modal |
|---|---|---|
| Select bird skin in ProfilePage | `profile.selected_bird_skin` | Character image + Character name |
| Upload custom avatar | `profile.avatar_url` | Profile image (large circle) |
| Change username (if allowed) | `profile.username` | Username heading (next to image) |
| Select character in game | `profile.selected_bird_skin` | Character info section |

### Example Flow
```
You Save: selected_bird_skin = "fire_bird"
   ↓
updateProfile({ selected_bird_skin: "fire_bird" })
   ↓
profile context updates → setProfile()
   ↓
Event dispatch: 'profile-updated'
   ↓
Modal re-renders with:
  - Image from getBirdImageSrc("fire_bird")
  - Character name "Fire Bird"
  - Character info section shows fire_bird details
```

## Real-Time Update Flow

### Step-by-Step What Happens:

1. **User saves profile in ProfilePage**
   ```
   Click "Save Avatar"
     ↓
   handleSaveAvatar() executes
     ↓
   updateProfile({ avatar_url: selectedImage })
   ```

2. **updateProfile updates context**
   ```
   setProfile(updatedProfile)
     ↓
   localStorage.setItem('flappypi-profile', ...)
     ↓
   window.dispatchEvent('profile-updated', ...)
   ```

3. **Modal listens and updates**
   ```
   'profile-updated' event received
     ↓
   handleProfileUpdate triggers
     ↓
   getCurrentProfileImage()
     ↓
   setProfileImage(newImage)
     ↓
   Modal re-renders with new image
   ```

## Expected Console Output

### On Modal Open:
```
📂 ProfileImageModal opened - loading profile data
💾 Loaded profile from localStorage: {
  username: "YourUsername",
  selected_bird_skin: "your_bird",
  avatar_url: "/path/to/avatar.png"
}
📝 ProfileImageModal updating display: {
  profileImage: "...",
  username: "YourUsername",
  selectedBirdSkin: "your_bird",
  avatarUrl: "/path/to/avatar.png",
  isAuthenticated: true
}
```

### After Profile Update:
```
📝 Profile updated and event dispatched: {
  avatar_url: "/new/path.png",
  selected_bird_skin: "new_bird"
}
🔄 ProfileImageModal received profile-updated event: {
  profile: {...},
  timestamp: 1701707400000
}
✅ ProfileImageModal updating from event: {
  newImage: "...",
  newUsername: "YourUsername",
  eventDetail: {...}
}
```

## Verification Checklist

- [ ] Profile modal shows correct username (not "MockPiUser")
- [ ] Avatar image displays selected character
- [ ] Character name displays formatted correctly
- [ ] "Live" badge shows green status
- [ ] Authentication status shows "Pi Network Authenticated"
- [ ] Changes save to localStorage
- [ ] Modal updates immediately when profile changes
- [ ] Data persists after page reload
- [ ] Refresh button updates data
- [ ] Console shows all expected log messages
- [ ] No errors in console

## Summary

The profile modal now displays **exactly** what is set because:

1. ✅ **Context-driven** - Uses useUserProfile hook as source of truth
2. ✅ **Event-based** - Updates triggered by 'profile-updated' event
3. ✅ **localStorage fallback** - Can load data even if context resets
4. ✅ **Real-time sync** - Changes visible immediately without reload
5. ✅ **Comprehensive logging** - Console shows exactly what's happening
6. ✅ **Multiple refresh points** - Can refresh manually or on modal open

**Result**: Profile modal is guaranteed to display the exact profile data that's set, with no mismatches between save and display.
