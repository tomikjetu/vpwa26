import type { Contact } from 'src/utils/types';

export interface ContactsState {
  contacts: Record<number, Contact>;
  isLoading: boolean;
  error: string | null;
}

export const createInitialState = (): ContactsState => ({
  contacts: {},
  isLoading: false,
  error: null,
});
