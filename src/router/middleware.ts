import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

/**
 * Authentication middleware that checks if user is authenticated
 * Redirects to /auth/login if not authenticated
 */
export function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const auth = useAuthStore();
  if (auth.checkAuthenticated) {
    // User is authenticated, allow navigation
    next();
  } else {
    // User is not authenticated, redirect to login
    // Save the intended destination in query params for redirect after login
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }
}

/**
 * Guest middleware that redirects authenticated users away from auth pages
 * Redirects to home if already authenticated
 */
export function requireGuest(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const auth = useAuthStore();
  if (auth.checkAuthenticated) {
    // User is already authenticated, redirect to home
    next('/');
  } else {
    // User is not authenticated, allow access to auth pages
    next();
  }
}

/**
 * Optional auth middleware - allows both authenticated and guest users
 * Can be used for pages that have different behavior based on auth status
 */
export function optionalAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  // Always allow navigation, regardless of auth status
  next();
}
