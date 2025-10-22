import { defineStore } from 'pinia';
import type { Channel, ChatMessagePayload } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';

export const useChannelStore = defineStore('channels', {
  state: () => ({
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
          1760716592343: {
            id: 1760716592343,
            nickname: 'dada',
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
            kickVoters: [1760716592343],
          },
        },
      },
    ] as Channel[],
    messages: {
      1: [
        {
          user: 2,
          text: 'Hello Alice :3',
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
  }),

  actions: {
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

    fetchOlderMessages(channelId: number, count = 20): { older: ChatMessagePayload[]; remaining: number } {
      if (!this.messages[channelId]) {
        this.messages[channelId] = []
      }

      // Only simulate infinite scroll for channel_1 (id = 1)
      if (channelId !== 1) {
        this.olderPagesLeft[channelId] = 0
        return { older: [] as ChatMessagePayload[], remaining: 0 }
      }

      const prevRemaining = this.olderPagesLeft[channelId]
      const remaining = typeof prevRemaining === 'number' ? prevRemaining : 5
      if (remaining <= 0) {
        this.olderPagesLeft[channelId] = 0
        return { older: [] as ChatMessagePayload[], remaining: 0 }
      }

      const existing = this.messages[channelId]
      const first = existing[0]?.time ?? new Date()
      const baseTs = first instanceof Date ? first.getTime() : new Date().getTime()

      const older: ChatMessagePayload[] = []
      for (let i = count - 1; i >= 0; i--) {
        const t = new Date(baseTs - (i + 1) * 60_000)
        older.push({
          user: 2,
          text: `Older message at ${t.toLocaleTimeString()}`,
          time: t,
          files: [],
          userNickname: 'Bob'
        })
      }

      this.messages[channelId] = [...older, ...existing]
      this.olderPagesLeft[channelId] = remaining - 1

      return { older, remaining: this.olderPagesLeft[channelId] }
    },

    /**
     * Update a member's typing text for a specific channel.
     * Pass an empty string to clear the indicator.
     */
    updateMemberTyping(channelId: number, memberId: number, text: string) {
      const channel = this.getChannelById(channelId)
      if (!channel) return
      const member = channel.members[memberId]
      if (!member) return
      member.currentlyTyping = text
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
    hasMoreOlder: (state) => {
      return (channelId: number) => {
        if (channelId !== 1) return false
        const left = state.olderPagesLeft[channelId]
        return (typeof left === 'number' ? left : 5) > 0
      }
    },
  },
});
