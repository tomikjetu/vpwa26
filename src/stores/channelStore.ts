import { defineStore } from 'pinia';
import { type Channel } from 'src/utils/types';

export const useChannelStore = defineStore('channels', {
  state: () => ({
    channels: [
      {
        id: 1,
        ownerId: 1,
        name: 'Channel_1',
        createdAt: new Date(),
        updatedAt: new Date(),
        joinedAt: new Date(),
        description: 'This is a folder channel',
        icon: 'lock',
        color: 'primary',
        infoColor: 'grey',
        isPublic: true,
      },
    ] as Channel[],
  }),

  actions: {
    addChannel(channel: Channel) {
      if (!this.channels.find((c) => c.id === channel.id)) {
        this.channels.push(channel);
      }
    },

    setChannels(channelList: Channel[]) {
      this.channels = channelList;
    },

    removeChannel(channelId: number) {
      this.channels = this.channels.filter((c) => c.id !== channelId);
    },
  },

  getters: {
    getChannelById: (state) => {
      return (id: number) => state.channels.find((c) => c.id === id);
    },
    getOwnedChannels: (state) => {
      return state.channels.filter((c) => c.ownerId === 1 && !c.isPublic);
    },
    totalChannels: (state) => state.channels.length,
  },
});
