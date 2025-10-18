import { defineStore } from 'pinia';
import type { Channel, ChatMessagePayload } from 'src/utils/types';
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)
export const useChannelStore = defineStore('channels', {
  state: () => ({
    channels: [
      {
        id: 1,
        ownerId: 3,
        name: "Channel_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        joinedAt: new Date(),
        description: "The default channel",
        icon: "group",
        color: "grey",
        infoColor: "red",
        isPublic: true,
        hasUnreadMsgs: true,
        members: {
          3: { 
            id: 3, 
            nickname: 'Alice', 
            isOwner: true, 
            kickVotes: 0, 
            currentlyTyping: "Ahoj, ako s", 
            kickVoters: [] 
          },
          2: { 
            id: 2, 
            nickname: 'Bob', 
            isOwner: false, 
            kickVotes: 1, 
            kickVoters: [3] 
          },
          1760716592343: {
            id: 1760716592343, 
            nickname: "dada", 
            isOwner: false, 
            kickVotes: 0, 
            currentlyTyping: "", 
            kickVoters: []
          },
          4: { 
            id: 4, 
            nickname: 'Cyril', 
            isOwner: false, 
            kickVotes: 1, 
            kickVoters: [1760716592343] 
          }
        }
      }
    ] as Channel[],
    messages: {
      1: [
        {
          user: 2,
          text: "Hello Alice :3",
          time: new Date(),
          files: [],
          userNickname: "Bob"
        }
      ]
    } as Record<number, ChatMessagePayload[]>,
    unreadMessages: {
      1: [
        {
          user: 3,
          text: "Hello Bob <3",
          time: new Date(),
          files: [],
          userNickname: "Alice"
        }
      ]
    } as Record<number, ChatMessagePayload[]>
  }),

  actions: {
    addChannel(channel: Channel) {
      if (!this.channels.find((c) => c.id === channel.id)) {
        this.channels.push(channel);
        this.messages[channel.id] = []
      }
    },

    setChannels(channelList: Channel[]) {
      this.channels = channelList;
    },

    removeChannel(channelId: number) {
      this.channels = this.channels.filter((c) => c.id !== channelId);
      delete this.messages[channelId]
      delete this.unreadMessages[channelId]
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = []
      }
      this.markAsRead(channelId)
      this.messages[channelId].push(msg)
    },

    markAsRead(channelId: number) {
      const msgs = this.getMessagesByChannelId(channelId)
      const unreadMsgs = this.getUnreadMessagesByChannelId(channelId)
      if (!msgs || !unreadMsgs) return

      msgs.push(...unreadMsgs)
      unreadMsgs.length = 0

      const channel = this.getChannelById(channelId)
      if (!channel) return
      channel.hasUnreadMsgs = false
    },

    incrementKickCounter(memberId: number, channelId: number, voterId: number) {
      const channel = this.getChannelById(channelId)
      if (!channel || !memberId) return

      const targetMember = channel.members[memberId]
      if(!targetMember) return
      targetMember.kickVotes += 1

      targetMember.kickVoters.push(voterId)
    }
  },

  getters: {
    getChannelById: (state) => {
      return (id: number) => state.channels.find((c) => c.id === id);
    },
    getOwnedChannels: (state) => {
      return state.channels.filter((c) => c.ownerId === getCurrentUser.value?.id);
    },
    getJoinedChannels: (state) => {
      return state.channels.filter((c) => c.ownerId !== getCurrentUser.value?.id);
    },
    totalChannels: (state) => state.channels.length,
    getMessagesByChannelId: (state) => {
      return (channelId: number) => state.messages[channelId] || []
    },
    getUnreadMessagesByChannelId: (state) => {
      return (channelId: number) => state.unreadMessages[channelId] || []
    }
  },
});
