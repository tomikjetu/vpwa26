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
        ownerId: 1,
        name: "Channel_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        joinedAt: new Date(),
        description: "The default channel",
        icon: "group",
        color: "grey",
        infoColor: "red",
        isPublic: true,
        members: {
          1: { id: 1, nickname: 'Alice', isOwner: true, kickVotes: 0, currentlyTyping: "Ahoj, ako s" },
          2: { id: 2, nickname: 'Bob', isOwner: false, kickVotes: 0 }
        }
      }
    ] as Channel[],
    messages: {} as Record<number, ChatMessagePayload[]>,
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
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      if (!this.messages[channelId]) {
        this.messages[channelId] = []
      }
      this.messages[channelId].push(msg)
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
  },
});
