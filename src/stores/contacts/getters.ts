import type { ContactsState } from './state';
import { computed } from 'vue';

export const contactsGetters = {
  getAllContacts: (state: ContactsState) => Object.values(state.contacts),

  getContactById: (state: ContactsState) => (id: number) => state.contacts[id] ?? null,

  getLoading: (state: ContactsState) => state.isLoading,

  getError: (state: ContactsState) => state.error,
};

// For composition API usage
export function createContactsGetters(contacts: ContactsState['contacts']) {
  const getAllContacts = computed(() => Object.values(contacts));
  const getContactById = (id: number) => computed(() => contacts[id] ?? null);

  return {
    getAllContacts,
    getContactById,
  };
}
