<template>
  <div class="chat-container">

    <template v-if="chatStore.channel">
      <ChatTopBar :channel="chatStore.channel" @toggle-drawer="emit('toggle-drawer')" />
      <ChatMessageList :channel="chatStore.channel" :messages="chatStore.messages"
        :unreadMessages="chatStore.unreadMessages" />
      <ChatInput @send="(msg: ChatMessagePayload, files: File[]) => chatStore.sendMessage(msg, files)" />
    </template>

    <template v-else>
      <div class="empty-chat">
        <q-icon name="chat_bubble_outline" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-lg">
          Select a channel
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Choose a channel from the sidebar to start chatting
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatTopBar from './ChatTopBar.vue'
import { useChatStore } from 'src/stores/chat'
import type { ChatMessagePayload } from 'src/utils/types'

const emit = defineEmits<{
  (e: 'toggle-drawer'): void
}>()

const chatStore = useChatStore()

</script>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  background: var(--bg-surface);
  margin-left: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-light);
}

/* Mobile: reduce margin */
@media (max-width: 1023px) {
  .chat-container {
    margin: 0;
    border-radius: 0;
    border: none;
  }
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 40px;
}
</style>
