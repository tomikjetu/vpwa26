import type { Contact, UserStatus } from 'src/utils/types';
import type { ContactsState } from './state';

/**
 * Mutations are synchronous functions that directly modify state.
 * They should be called via commit() from actions.
 */
export const contactsMutations = {
  ADD_CONTACT(state: ContactsState, contact: Contact) {
    state.contacts[contact.id] = contact;
  },

  REMOVE_CONTACT(state: ContactsState, id: number) {
    delete state.contacts[id];
  },

  UPDATE_STATUS(state: ContactsState, payload: { id: number; status: UserStatus }) {
    const contact = state.contacts[payload.id];
    if (contact) {
      contact.status = payload.status;
    }
  },

  SET_CONTACTS(state: ContactsState, contacts: Record<number, Contact>) {
    state.contacts = contacts;
  },

  SET_LOADING(state: ContactsState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_ERROR(state: ContactsState, error: string | null) {
    state.error = error;
  },
};

export type ContactsMutations = typeof contactsMutations;
