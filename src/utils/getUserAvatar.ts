import { UserProfile } from '@/types/gameTypes';

/**
 * Get the user's avatar URL from their profile without emitting console logs.
 * Always returns a valid string, defaulting to `/flappy-logo.png`.
 */
export function getUserAvatar(profile: UserProfile | null): string {
  if (!profile) return '/flappy-logo.png';

  const avatarUrl = (profile.avatar_url || '').trim();
  if (avatarUrl) return avatarUrl;

  return '/flappy-logo.png';
}

/**
 * Get the user's avatar URL with fallback options
 * @param profile - The user's profile
 * @param fallback - Optional fallback URL
 * @returns The avatar URL
 */
export function getUserAvatarWithFallback(profile: UserProfile | null, fallback?: string): string {
  const avatar = getUserAvatar(profile);
  if (avatar === '/flappy-logo.png' && fallback) return fallback;
  return avatar;
}