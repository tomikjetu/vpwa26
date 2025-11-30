import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Contact, UserStatus } from 'src/utils/types.ts';
import { useAuthStore } from 'src/stores/auth-store';
import { socketEmit } from 'src/services/socketService';

/** Pinia store for managing contacts */
export const useContacts = defineStore('contacts', () => {
  // Get auth store inside the factory function to avoid initialization issues
  const auth = useAuthStore();

  // State — dictionary of contacts keyed by ID
  const contacts = ref<Record<number, Contact>>({});

  // Getters
  const getAllContacts = computed(() => Object.values(contacts.value));
  const getContactById = (id: number) => computed(() => contacts.value[id] ?? null);

  // Actions
  function addContact(contact: Contact) {
    contacts.value[contact.id] = contact;
  }

  function removeContact(id: number) {
    delete contacts.value[id];
  }

  function updateStatus(id: number, newStatus: UserStatus) {
    if (contacts.value[id]) {
      contacts.value[id].status = newStatus;
    }
  }

  function changeStatus(newStatus: UserStatus) {
    const currentUser = auth.getCurrentUser;
    if (!currentUser) return;

    // Update local state
    currentUser.status = newStatus;
    auth.setStatus(newStatus);
    const contact = contacts.value[currentUser.id];
    if (contact) {
      contact.status = newStatus;
    }

    // Emit to server
    socketEmit.updateStatus(newStatus);
  }

  // Expose state, getters, and actions
  return {
    contacts,
    getAllContacts,
    getContactById,
    addContact,
    removeContact,
    updateStatus,
    changeStatus,
  };
});
