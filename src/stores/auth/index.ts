import { defineStore } from 'pinia';
import { createInitialState, type AuthState } from './state';
import { authGetters } from './getters';
import { authMutations } from './mutations';
import { createAuthActions } from './actions';

export type { AuthState } from './state';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => createInitialState(),

  getters: authGetters,

  actions: {
    // Create a commit function to apply mutations
    commit<K extends keyof typeof authMutations>(
      this: AuthState,
      mutation: K,
      payload?: Parameters<(typeof authMutations)[K]>[1],
    ) {
      const mutationFn = authMutations[mutation] as (state: AuthState, payload?: unknown) => void;
      mutationFn(this, payload);
    },

    // Delegate to action creators
    setAuth(token: string, user: Parameters<ReturnType<typeof createAuthActions>['setAuth']>[1]) {
      const actions = createAuthActions(this, this.commit.bind(this));
      actions.setAuth(token, user);
    },

    clearAuth() {
      const actions = createAuthActions(this, this.commit.bind(this));
      actions.clearAuth();
    },

    updateUser(updatedUser: Parameters<ReturnType<typeof createAuthActions>['updateUser']>[0]) {
      const actions = createAuthActions(this, this.commit.bind(this));
      actions.updateUser(updatedUser);
    },

    setStatus(status: Parameters<ReturnType<typeof createAuthActions>['setStatus']>[0]) {
      const actions = createAuthActions(this, this.commit.bind(this));
      actions.setStatus(status);
    },

    updateToken(newToken: string) {
      const actions = createAuthActions(this, this.commit.bind(this));
      actions.updateToken(newToken);
    },

    async login(credentials: Parameters<ReturnType<typeof createAuthActions>['login']>[0]) {
      const actions = createAuthActions(this, this.commit.bind(this));
      return actions.login(credentials);
    },

    async register(credentials: Parameters<ReturnType<typeof createAuthActions>['register']>[0]) {
      const actions = createAuthActions(this, this.commit.bind(this));
      return actions.register(credentials);
    },

    async logout() {
      const actions = createAuthActions(this, this.commit.bind(this));
      return actions.logout();
    },

    async updateProfile(
      payload: Parameters<ReturnType<typeof createAuthActions>['updateProfile']>[0],
    ) {
      const actions = createAuthActions(this, this.commit.bind(this));
      return actions.updateProfile(payload);
    },
  },

  // Enable persistence for this store
  persist: true,
});
