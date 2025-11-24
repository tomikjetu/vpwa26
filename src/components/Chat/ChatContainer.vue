<template>
  <div class="chat-container">

    <template v-if="chatStore.channel">
      <ChatTopBar :channel="chatStore.channel" />
      <ChatMessageList :channel="chatStore.channel" :messages="chatStore.messages"
        :unreadMessages="chatStore.unreadMessages" />
      <ChatInput @send="(msg: ChatMessagePayload, files: File[]) => chatStore.sendMessage(msg, files)" @typing="onTyping" />
    </template>

    <template v-else>
      <div class="empty-chat">
        <q-icon name="chat" size="48px" color="grey-6" />
        <div class="text-subtitle1 text-grey-7 q-mt-md">
          Select a channel to start chatting
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatTopBar from './ChatTopBar.vue'
import { useChatStore } from 'src/stores/chat-store'
import { useChannelStore } from 'src/stores/channelStore'
import { useAuthStore } from 'src/stores/auth-store'
import type { ChatMessagePayload } from 'src/utils/types'

const chatStore = useChatStore()
const channelStore = useChannelStore()
const authStore = useAuthStore()

function onTyping(text: string) {
  if (!chatStore.channel || !authStore.getCurrentUser?.id) return
  channelStore.updateMemberTyping(chatStore.channel.id, authStore.getCurrentUser.id, text)
}

</script>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  flex: 1 1 auto;
  border: 1px solid #ddd;
}

.body--dark .chat-container {
  border-color: #444;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  opacity: 0.8;
}
</style>
