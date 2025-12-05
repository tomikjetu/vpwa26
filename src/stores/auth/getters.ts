import type { AuthState } from './state';

export const authGetters = {
  getCurrentUser: (state: AuthState) => state.user,
  getToken: (state: AuthState) => state.token,
  checkAuthenticated: (state: AuthState) => state.isAuthenticated && !!state.user && !!state.token,
  getLoading: (state: AuthState) => state.isLoading,
  getError: (state: AuthState) => state.error,
};
