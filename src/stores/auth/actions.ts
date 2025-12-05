import type { LoginCredentials, RegisterCredentials, User } from 'src/utils/types';
import { authService } from 'src/services/authService';
import { disconnectSocket } from 'src/services/socketService';
import type { AuthState } from './state';
import type { authMutations } from './mutations';

type Commit = <K extends keyof typeof authMutations>(
  mutation: K,
  payload?: Parameters<(typeof authMutations)[K]>[1],
) => void;

/**
 * Actions are async functions that commit mutations.
 * They handle business logic and side effects.
 */
export function createAuthActions(state: AuthState, commit: Commit) {
  return {
    // Synchronous actions that delegate to mutations
    setAuth(token: string, user: User) {
      commit('SET_AUTH', { token, user });
    },

    clearAuth() {
      disconnectSocket();
      commit('CLEAR_AUTH');
    },

    updateUser(updatedUser: User) {
      commit('SET_USER', updatedUser);
    },

    setStatus(status: User['status']) {
      commit('SET_STATUS', status);
    },

    updateToken(newToken: string) {
      commit('SET_TOKEN', newToken);
    },

    // Async actions that coordinate service calls and state updates
    async login(credentials: LoginCredentials): Promise<User> {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const data = await authService.login(credentials);
        const user: User = {
          id: data.user.id,
          name: data.user.first_name,
          surname: data.user.last_name,
          nickName: data.user.nick,
          email: data.user.email,
        };

        commit('SET_AUTH', { token: data.sessionToken, user });
        return user;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async register(credentials: RegisterCredentials): Promise<User> {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const data = await authService.register(credentials);
        const user: User = {
          id: data.user.id,
          name: data.user.first_name,
          surname: data.user.last_name,
          nickName: data.user.nick,
          email: data.user.email,
        };

        commit('SET_AUTH', { token: data.sessionToken, user });
        return user;
      } catch (err) {
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout(): Promise<void> {
      commit('SET_LOADING', true);
      try {
        await authService.logout();
      } finally {
        disconnectSocket();
        commit('CLEAR_AUTH');
        commit('SET_LOADING', false);
      }
    },

    async updateProfile(payload: { userId: number; userData: Partial<User> }): Promise<User> {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const updated = await authService.updateProfile(payload.userId, payload.userData);
        commit('SET_USER', updated);
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  };
}
