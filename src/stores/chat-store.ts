import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types'
import { useChannelStore } from './channelStore'

export const useChatStore = defineStore('chatContainer', () => {
  const channel = ref<Channel | null>(null)
  const channelStore = useChannelStore()

  const messages = computed(() => {
    if (!channel.value) return []
    return channelStore.getMessages()
  })

  const unreadMessages = computed(() => {
    if (!channel.value) return []
    return channelStore.getUnreadMessages()
  })

  function sendMessage(msg: ChatMessagePayload, files: File[]) {
    if (!channel.value) return
    channelStore.sendMessage(msg, channel.value.id, files)
  }

  async function openChat(newChannel: Channel | null) {
    channel.value = newChannel
    if(!newChannel) return
    await channelStore.loadMessages(newChannel.id)
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
    sendMessage,
    openChat,
    closeChat
  }
})
