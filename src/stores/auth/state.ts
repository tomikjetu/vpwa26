import type { User } from 'src/utils/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const createInitialState = (): AuthState => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
});
