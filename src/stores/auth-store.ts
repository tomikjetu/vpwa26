import { defineStore } from 'pinia';
import type { User, UserStatus, LoginCredentials, RegisterCredentials } from 'src/utils/types';
import { authService } from 'src/services/authService';
import { disconnectSocket } from 'src/services/socketService';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    getCurrentUser: (state) => state.user,
    getToken: (state) => state.token,
    checkAuthenticated: (state) => state.isAuthenticated && !!state.user && !!state.token,
    getLoading: (state) => !!state.isLoading,
    getError: (state) => state.error ?? null,
  },

  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
      // No need for manual localStorage - persistence plugin handles it automatically
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      // Disconnect socket when user logs out
      disconnectSocket();
      // No need for manual localStorage cleanup - persistence plugin handles it automatically
    },

    updateUser(updatedUser: User) {
      this.user = updatedUser;
      // No need for manual localStorage - persistence plugin handles it automatically
    },

    setStatus(status: UserStatus) {
      if (!this.user) return;
      this.user = { ...this.user, status };
      // persistence plugin will store updated user automatically
    },

    updateToken(newToken: string) {
      this.token = newToken;
      // No need for manual localStorage - persistence plugin handles it automatically
    },

    // Async actions that coordinate service calls and state updates
    async login(credentials: LoginCredentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await authService.login(credentials);
        const user = {
          id: data.user.id,
          name: data.user.first_name,
          surname: data.user.last_name,
          nickName: data.user.nick,
          email: data.user.email,
        } as User;

        this.setAuth(data.sessionToken, user);
        return user;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async register(credentials: RegisterCredentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await authService.register(credentials);
        const user = {
          id: data.user.id,
          name: data.user.first_name,
          surname: data.user.last_name,
          nickName: data.user.nick,
          email: data.user.email,
        } as User;

        this.setAuth(data.sessionToken, user);
        return user;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } finally {
        this.clearAuth();
      }
    },

    async updateProfile(payload: { userId: number; userData: Partial<User> }) {
      this.isLoading = true;
      this.error = null;
      try {
        const updated = await authService.updateProfile(payload.userId, payload.userData);
        this.updateUser(updated);
        return updated;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },

  // Enable persistence for this store
  persist: true,
});
