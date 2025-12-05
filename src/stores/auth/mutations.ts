import type { User, UserStatus } from 'src/utils/types';
import type { AuthState } from './state';

/**
 * Mutations are synchronous functions that directly modify state.
 * They should be called via commit() from actions.
 */
export const authMutations = {
  SET_AUTH(state: AuthState, payload: { token: string; user: User }) {
    state.token = payload.token;
    state.user = payload.user;
    state.isAuthenticated = true;
  },

  CLEAR_AUTH(state: AuthState) {
    state.token = null;
    state.user = null;
    state.isAuthenticated = false;
    state.error = null;
  },

  SET_USER(state: AuthState, user: User) {
    state.user = user;
  },

  SET_STATUS(state: AuthState, status: UserStatus) {
    if (state.user) {
      state.user = { ...state.user, status };
    }
  },

  SET_TOKEN(state: AuthState, token: string) {
    state.token = token;
  },

  SET_LOADING(state: AuthState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_ERROR(state: AuthState, error: string | null) {
    state.error = error;
  },
};

export type AuthMutations = typeof authMutations;
