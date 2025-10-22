import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types'
import { useChannelStore } from './channelStore'

export const useChatStore = defineStore('chatContainer', () => {
  const channel = ref<Channel | null>(null)

  const messages = computed(() => {
    if (!channel.value) return []
    const channelStore = useChannelStore()
    return channelStore.getMessagesByChannelId(channel.value.id)
  })

  const unreadMessages = computed(() => {
    if (!channel.value) return []
    const channelStore = useChannelStore()
    return channelStore.getUnreadMessagesByChannelId(channel.value.id)
  })

  function addMessage(msg: ChatMessagePayload) {
    if (!channel.value) return
    const channelStore = useChannelStore()
    channelStore.addMessage(msg, channel.value.id)
  }

  function openChat(newChannel: Channel | null) {
    channel.value = newChannel
  }

  function closeChat() {
    channel.value = null
  }

  return {
    // state
    channel,

    // getters
    messages,
    unreadMessages,

    // actions
    addMessage,
    openChat,
    closeChat
  }
})
