import type { ChatState } from './state';
import { useChannelStore } from 'src/stores/channel';

export const chatGetters = {
  getChannel: (state: ChatState) => state.channel,

  messages: (state: ChatState) => {
    if (!state.channel) return [];
    const channelStore = useChannelStore();
    return channelStore.getMessages();
  },

  unreadMessages: (state: ChatState) => {
    if (!state.channel) return [];
    const channelStore = useChannelStore();
    return channelStore.getUnreadMessages();
  },

  getLoading: (state: ChatState) => state.isLoading,

  getError: (state: ChatState) => state.error,
};
