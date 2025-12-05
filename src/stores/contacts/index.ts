import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Contact, UserStatus } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth';
import { socketEmit } from 'src/services/socketService';

export interface ContactsState {
  contacts: Record<number, Contact>;
  isLoading: boolean;
  error: string | null;
}

/** Pinia store for managing contacts */
export const useContacts = defineStore('contacts', () => {
  // Get auth store inside the factory function to avoid initialization issues
  const auth = useAuthStore();

  // State — dictionary of contacts keyed by ID
  const contacts = ref<Record<number, Contact>>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getAllContacts = computed(() => Object.values(contacts.value));
  const getContactById = (id: number) => computed(() => contacts.value[id] ?? null);
  const getLoading = computed(() => isLoading.value);
  const getError = computed(() => error.value);

  // Mutations (private, called by actions)
  function _addContact(contact: Contact) {
    contacts.value[contact.id] = contact;
  }

  function _removeContact(id: number) {
    delete contacts.value[id];
  }

  function _updateStatus(id: number, newStatus: UserStatus) {
    if (contacts.value[id]) {
      contacts.value[id].status = newStatus;
    }
  }

  function _setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function _setError(err: string | null) {
    error.value = err;
  }

  // Actions
  function addContact(contact: Contact) {
    _addContact(contact);
  }

  function removeContact(id: number) {
    _removeContact(id);
  }

  function updateStatus(id: number, newStatus: UserStatus) {
    _updateStatus(id, newStatus);
  }

  function changeStatus(newStatus: UserStatus) {
    _setLoading(true);
    _setError(null);

    try {
      const currentUser = auth.getCurrentUser;
      if (!currentUser) {
        _setLoading(false);
        return;
      }

      // Update local state
      currentUser.status = newStatus;
      auth.setStatus(newStatus);

      const contact = contacts.value[currentUser.id];
      if (contact) {
        _updateStatus(currentUser.id, newStatus);
      }

      // Emit to server
      socketEmit.updateStatus(newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      _setError(errorMessage);
    } finally {
      _setLoading(false);
    }
  }

  // Expose state, getters, and actions
  return {
    // State
    contacts,
    isLoading,
    error,

    // Getters
    getAllContacts,
    getContactById,
    getLoading,
    getError,

    // Actions
    addContact,
    removeContact,
    updateStatus,
    changeStatus,
  };
});
