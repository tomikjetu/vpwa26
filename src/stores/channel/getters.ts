import type { ChannelState } from './state';
import { useAuthStore } from 'src/stores/auth';

export const channelGetters = {
  getChannelById: (state: ChannelState) => {
    return (id: number) => state.channels.find((c) => c.id === id);
  },

  getOwnedChannels: (state: ChannelState) => {
    const auth = useAuthStore();
    const user = auth.getCurrentUser;
    return state.channels.filter((c) => c.ownerId === user?.id);
  },

  getJoinedChannels: (state: ChannelState) => {
    const auth = useAuthStore();
    const user = auth.getCurrentUser;
    return state.channels.filter((c) => c.ownerId !== user?.id);
  },

  totalChannels: (state: ChannelState) => state.channels.length,

  getMessages: (state: ChannelState) => {
    return () => state.messages || [];
  },

  getUnreadMessages: (state: ChannelState) => {
    return () => state.unreadMessages || [];
  },

  getMemberById: (state: ChannelState) => {
    return (id: number, channelId: number) => {
      return state.channels.find((c) => c.id === channelId)?.members[id];
    };
  },

  getMemberByUserId: (state: ChannelState) => {
    return (userId: number, channelId: number) => {
      const channel = state.channels.find((c) => c.id === channelId);
      if (!channel) return undefined;
      return Object.values(channel.members).find((m) => m.userId === userId);
    };
  },

  getChannelInviteById: (state: ChannelState) => {
    return (id: number) => state.channelInvites.find((c) => c.id === id);
  },

  hasMoreOlder: (state: ChannelState) => {
    return (channelId: number) => {
      const left = state.olderPagesLeft[channelId];
      return (typeof left === 'number' ? left : 0) > 0;
    };
  },

  getLoading: (state: ChannelState) => state.isLoading,

  getError: (state: ChannelState) => state.error,
};
