import { useAuthStore } from 'src/stores/auth';

/**
 * Check if notifications should be suppressed based on user status
 * Returns true if notifications should NOT be shown
 */
export function shouldSuppressNotifications(): boolean {
  const authStore = useAuthStore();
  const status = authStore.getCurrentUser?.status;

  // Suppress notifications when user is in DND mode
  return status === 'dnd';
}

/**
 * Check if user is in DND mode
 */
export function isUserDnd(): boolean {
  const authStore = useAuthStore();
  return authStore.getCurrentUser?.status === 'dnd';
}
