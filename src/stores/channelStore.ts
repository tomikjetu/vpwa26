import { defineStore } from "pinia"
import { Channel } from "src/utils/types"

export const useChannelStore = defineStore("channels", {
  state: () => ({
    channels: [] as Channel[] 
  }),

  actions: {
    addChannel(channel: Channel) {
      if (!this.channels.find(c => c.id === channel.id)) {
        this.channels.push(channel)
      }
    },

    setChannels(channelList: Channel[]) {
      this.channels = channelList
    },

    removeChannel(channelId: number) {
      this.channels = this.channels.filter(c => c.id !== channelId)
    }
  },

  getters: {
    getChannelById: (state) => {
      return (id: number) => state.channels.find(c => c.id === id)
    },
    totalChannels: (state) => state.channels.length
  }
})
