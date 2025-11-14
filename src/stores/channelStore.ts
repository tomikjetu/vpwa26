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
    // Get auth store inside state function to avoid initialization issues
    const auth = useAuthStore();

    return {
      channels: [
        {
          id: 1,
          ownerId: 3,
          name: 'Channel_1',
          createdAt: new Date(),
          updatedAt: new Date(),
          joinedAt: new Date(),
          description: 'The default channel',
          icon: 'group',
          color: 'grey',
          infoColor: 'red',
          isPublic: true,
          hasUnreadMsgs: true,
          members: {
            3: {
              id: 3,
              nickname: 'Alice',
              isOwner: true,
              kickVotes: 0,
              currentlyTyping: 'Ahoj, ako s',
              kickVoters: [],
            },
            2: {
              id: 2,
              nickname: 'Bob',
              isOwner: false,
              kickVotes: 1,
              kickVoters: [3],
            },
            [auth.getCurrentUser ? auth.getCurrentUser.id : 7]: {
              id: auth.getCurrentUser ? auth.getCurrentUser.id : 7,
              nickname: auth.getCurrentUser ? auth.getCurrentUser.nickName : 'DefaultUser',
              isOwner: false,
              kickVotes: 0,
              currentlyTyping: '',
              kickVoters: [],
            },
            4: {
              id: 4,
              nickname: 'Cyril',
              isOwner: false,
              kickVotes: 1,
              kickVoters: [auth.getCurrentUser ? auth.getCurrentUser.id : 7],
            },
          },
        },
      ] as Channel[],
      channelInvites: [
        {
          id: 2,
          name: 'Channel_2',
          invitedAt: new Date(),
          icon: 'lock',
          color: 'red',
        },
      ] as ChannelInvite[],
      messages: {
        1: [
          {
            user: 2,
            text: 'Hello Alice :3',
            time: new Date(),
            files: [],
            userNickname: 'Bob',
          },
          {
            user: 2,
            text: 'Hello @3 aand @4',
            time: new Date(),
            files: [],
            userNickname: 'Bob',
          },
          {
            user: 2,
            text: 'Hello @' + auth.getCurrentUser?.id,
            time: new Date(),
            files: [],
            userNickname: 'Bob',
          },
        ],
      } as Record<number, ChatMessagePayload[]>,
      unreadMessages: {
        1: [
          {
            user: 3,
            text: 'Hello Bob <3',
            time: new Date(),
            files: [],
            userNickname: 'Alice',
          },
        ],
      } as Record<number, ChatMessagePayload[]>,
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

    fetchOlderMessages(
      channelId: number,
      count = 20,
    ): { older: ChatMessagePayload[]; remaining: number } {
      if (!this.messages[channelId]) {
        this.messages[channelId] = [];
      }

      // Only simulate infinite scroll for channel_1 (id = 1)
      if (channelId !== 1) {
        this.olderPagesLeft[channelId] = 0;
        return { older: [] as ChatMessagePayload[], remaining: 0 };
      }

      const prevRemaining = this.olderPagesLeft[channelId];
      const remaining = typeof prevRemaining === 'number' ? prevRemaining : 5;
      if (remaining <= 0) {
        this.olderPagesLeft[channelId] = 0;
        return { older: [] as ChatMessagePayload[], remaining: 0 };
      }

      const existing = this.messages[channelId];
      const first = existing[0]?.time ?? new Date();
      const baseTs = first instanceof Date ? first.getTime() : new Date().getTime();

      const older: ChatMessagePayload[] = [];
      for (let i = count - 1; i >= 0; i--) {
        const t = new Date(baseTs - (i + 1) * 60_000);
        older.push({
          user: 2,
          text: `Older message at ${t.toLocaleTimeString()}`,
          time: t,
          files: [],
          userNickname: 'Bob',
        });
      }

      this.messages[channelId] = [...older, ...existing];
      this.olderPagesLeft[channelId] = remaining - 1;

      return { older, remaining: this.olderPagesLeft[channelId] };
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

    async fetchChannelsAction() {
      this.isLoading = true;
      this.error = null;
      try {
        const channels = await channelService.fetchChannels();
        this.setChannels(channels);
        return channels;
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
        if (channelId !== 1) return false;
        const left = state.olderPagesLeft[channelId];
        return (typeof left === 'number' ? left : 5) > 0;
      };
    },
    getLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },
});
