import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Contact } from 'src/utils/types.ts';
import { useAuthStore } from 'src/stores/auth-store';

const auth = useAuthStore()
/** Pinia store for managing contacts */
export const useContacts = defineStore('contacts', () => {
  // State — dictionary of contacts keyed by ID

  const contacts = ref<Record<number, Contact>>({
    [auth.getCurrentUser ? auth.getCurrentUser.id : 7]: { id: auth.getCurrentUser ? auth.getCurrentUser.id : 7, status: 'online' },
    2: { id: 2, status: 'dnd' },
    3: { id: 3, status: 'online' },
    4: { id: 4, status: 'offline' },
  });

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

  function updateStatus(id: number, newStatus: 'online' | 'dnd' | 'offline' | 'disabled') {
    if (contacts.value[id]) {
      contacts.value[id].status = newStatus;
    }
  }

  // Expose state, getters, and actions
  return {
    contacts,
    getAllContacts,
    getContactById,
    addContact,
    removeContact,
    updateStatus,
  };
});
