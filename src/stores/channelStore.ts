import { defineStore } from 'pinia';
import type { Channel, ChatMessagePayload, ChannelInvite } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import { channelService } from 'src/services/channelService';

interface ChannelState {
  channels: Channel[];
  channelInvites: ChannelInvite[];
  messages: Record<number, ChatMessagePayload[]>;
  unreadMessages: Record<number, ChatMessagePayload[]>;
  olderPagesLeft: Record<number, number>;
  isLoading: boolean;
  error: string | null;
}

export const useChannelStore = defineStore('channels', {
  state: (): ChannelState => {
    return {
      channels: [] as Channel[],
      channelInvites: [] as ChannelInvite[],
      messages: {} as Record<number, ChatMessagePayload[]>,
      unreadMessages: {} as Record<number, ChatMessagePayload[]>,
      olderPagesLeft: {} as Record<number, number>,
      isLoading: false,
      error: null,
    };
  },

  actions: {
    removeInvite(channelId: number) {
      this.channelInvites = this.channelInvites.filter((invite) => invite.id !== channelId);
    },

    addChannel(channel: Channel) {
      if (!this.channels.find((c) => c.id === channel.id)) {
        this.channels.push(channel);
        this.messages[channel.id] = [];
      }
    },

    setChannels(channelList: Channel[]) {
      this.channels = channelList;
    },

    removeChannel(channelId: number) {
      this.channels = this.channels.filter((c) => c.id !== channelId);
      delete this.messages[channelId];
      delete this.unreadMessages[channelId];
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = [];
      }
      this.markAsRead(channelId);
      this.messages[channelId].push(msg);
    },

    addMessages(msgs: ChatMessagePayload[], channelId: number) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = [];
      }
      this.messages[channelId].push(...msgs);
    },

    markAsRead(channelId: number) {
      const msgs = this.getMessagesByChannelId(channelId);
      const unreadMsgs = this.getUnreadMessagesByChannelId(channelId);
      if (!msgs || !unreadMsgs) return;

      msgs.push(...unreadMsgs);
      unreadMsgs.length = 0;

      const channel = this.getChannelById(channelId);
      if (!channel) return;
      channel.hasUnreadMsgs = false;
    },

    incrementKickCounter(memberId: number, channelId: number, voterId: number) {
      const channel = this.getChannelById(channelId);
      if (!channel || !memberId) return;

      const targetMember = channel.members[memberId];
      if (!targetMember) return;
      if (targetMember.id === channel.ownerId)
        return Notify.create({
          type: 'negative',
          message: 'Cannot kick the channel owner',
          position: 'top',
        });
      targetMember.kickVotes += 1;

      targetMember.kickVoters.push(voterId);
      Notify.create({
        type: 'info',
        message: `You have voted to kick ${targetMember.nickname} from ${channel.name}. Total votes: ${targetMember.kickVotes}`,
        position: 'top',
      });
    },

    fetchOlderMessages(channelId: number): { older: ChatMessagePayload[]; remaining: number } {
      if (!this.messages[channelId]) {
        this.messages[channelId] = [];
      }

      // For now, return empty - backend should provide pagination
      // This can be implemented when backend supports message history pagination
      this.olderPagesLeft[channelId] = 0;
      return { older: [] as ChatMessagePayload[], remaining: 0 };
    },

    /**
     * Update a member's typing text for a specific channel.
     * Pass an empty string to clear the indicator.
     */
    updateMemberTyping(channelId: number, memberId: number, text: string) {
      const channel = this.getChannelById(channelId);
      if (!channel) return;
      const member = channel.members[memberId];
      if (!member) return;
      member.currentlyTyping = text;
    },

    // === Async Actions coordinating with channelService ===
    // Note: Socket operations don't return data immediately - they trigger socket events
    // that are handled by socketService listeners which update the store reactively
    // Server pushes all channel data via socket events - no HTTP polling needed

    createChannelAction(name: string, isPublic: boolean) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.createChannel(name, isPublic);
        // Channel will be added via socket event 'channel:created'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    joinChannelAction(channelName: string) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.joinChannel(channelName);
        // Channel will be added via socket event 'channel:joined'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    quitChannelAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.quitChannel(channelId);
        // Channel will be removed via socket event 'channel:left'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    revokeUserAction(channelId: number, userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.revokeUserFromChannel(channelId, userId);
        // User will be removed via socket event 'member:left'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    inviteUserAction(channelId: number, userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.inviteUserToChannel(channelId, userId);
        // Invite will be sent via socket event
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    cancelChannelAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.cancelChannel(channelId);
        // Channel will be removed via socket event 'channel:deleted'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    kickUserAction(channelId: number, userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.kickUserFromChannel(channelId, userId);
        // Increment kick counter locally
        const auth = useAuthStore();
        const currentUser = auth.getCurrentUser;
        if (currentUser) {
          this.incrementKickCounter(userId, channelId, currentUser.id);
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    acceptChannelInviteAction(channelInviteId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.acceptChannelInvite(channelInviteId);
        // Channel will be added and invite removed via socket event 'channel:invite:accepted'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    declineChannelInviteAction(channelInviteId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.declineChannelInvite(channelInviteId);
        // Invite will be removed via socket event 'channel:invite:declined'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    getChannelById: (state) => {
      return (id: number) => state.channels.find((c) => c.id === id);
    },
    getOwnedChannels: (state) => {
      const auth = useAuthStore();
      const user = auth.getCurrentUser;
      return state.channels.filter((c) => c.ownerId === user?.id);
    },
    getJoinedChannels: (state) => {
      const auth = useAuthStore();
      const user = auth.getCurrentUser;
      return state.channels.filter((c) => c.ownerId !== user?.id);
    },
    totalChannels: (state) => state.channels.length,
    getMessagesByChannelId: (state) => {
      return (channelId: number) => state.messages[channelId] || [];
    },
    getUnreadMessagesByChannelId: (state) => {
      return (channelId: number) => state.unreadMessages[channelId] || [];
    },
    getChannelInviteById: (state) => {
      return (id: number) => state.channelInvites.find((c) => c.id === id);
    },
    hasMoreOlder: (state) => {
      return (channelId: number) => {
        // Backend pagination not implemented yet
        const left = state.olderPagesLeft[channelId];
        return (typeof left === 'number' ? left : 0) > 0;
      };
    },
    getLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },
});
