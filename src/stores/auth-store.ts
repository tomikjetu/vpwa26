import { defineStore } from 'pinia';
import type { User, UserStatus } from 'src/utils/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    getCurrentUser: (state) => state.user,
    getToken: (state) => state.token,
    checkAuthenticated: (state) => state.isAuthenticated && !!state.user && !!state.token,
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
  },

  // Enable persistence for this store
  persist: true,
});
