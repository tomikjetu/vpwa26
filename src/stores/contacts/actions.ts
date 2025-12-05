import type { Contact, UserStatus } from 'src/utils/types';
import type { ContactsState } from './state';
import type { contactsMutations } from './mutations';
import { socketEmit } from 'src/services/socketService';
import { useAuthStore } from 'src/stores/auth';

type Commit = <K extends keyof typeof contactsMutations>(
  mutation: K,
  payload?: Parameters<(typeof contactsMutations)[K]>[1],
) => void;

/**
 * Actions are async functions that commit mutations.
 * They handle business logic and side effects.
 */
export function createContactsActions(state: ContactsState, commit: Commit) {
  return {
    addContact(contact: Contact) {
      commit('ADD_CONTACT', contact);
    },

    removeContact(id: number) {
      commit('REMOVE_CONTACT', id);
    },

    updateStatus(id: number, newStatus: UserStatus) {
      commit('UPDATE_STATUS', { id, status: newStatus });
    },

    changeStatus(newStatus: UserStatus) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const authStore = useAuthStore();
        const currentUser = authStore.getCurrentUser;
        if (!currentUser) {
          commit('SET_LOADING', false);
          return;
        }

        // Update auth store status
        authStore.setStatus(newStatus);

        // Update contact status if exists
        if (state.contacts[currentUser.id]) {
          commit('UPDATE_STATUS', { id: currentUser.id, status: newStatus });
        }

        // Emit to server
        socketEmit.updateStatus(newStatus);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
      } finally {
        commit('SET_LOADING', false);
      }
    },
  };
}
