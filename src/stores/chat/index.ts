import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatMessagePayload, Channel } from 'src/utils/types';
import { useChannelStore } from 'src/stores/channel';

export interface ChatState {
  channel: Channel | null;
  isLoading: boolean;
  error: string | null;
}

export const useChatStore = defineStore('chatContainer', () => {
  // State
  const channel = ref<Channel | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Lazy getter for channel store
  const channelStore = useChannelStore();

  // Getters
  const messages = computed(() => {
    if (!channel.value) return [];
    return channelStore.getMessages();
  });

  const unreadMessages = computed(() => {
    if (!channel.value) return [];
    return channelStore.getUnreadMessages();
  });

  const getLoading = computed(() => isLoading.value);
  const getError = computed(() => error.value);

  // Mutations (private, called by actions)
  function _setChannel(newChannel: Channel | null) {
    channel.value = newChannel;
  }

  function _setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function _setError(err: string | null) {
    error.value = err;
  }

  // Actions
  function sendMessage(msg: ChatMessagePayload, files: File[]) {
    if (!channel.value) return;
    channelStore.sendMessage(msg, channel.value.id, files);
  }

  async function openChat(newChannel: Channel | null): Promise<void> {
    _setLoading(true);
    _setError(null);
    try {
      _setChannel(newChannel);
      if (!newChannel) return;
      await channelStore.loadMessages(newChannel.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      _setError(errorMessage);
      throw err;
    } finally {
      _setLoading(false);
    }
  }

  function closeChat() {
    _setChannel(null);
  }

  return {
    // state
    channel,
    isLoading,
    error,

    // getters
    messages,
    unreadMessages,
    getLoading,
    getError,

    // actions
    sendMessage,
    openChat,
    closeChat,
  };
});
