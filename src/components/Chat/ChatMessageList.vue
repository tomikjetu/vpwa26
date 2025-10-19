<template>
  <div class="messages-container">
    <ChatMessage v-for="(m, index) in messages" :payload="m" :key="index" @show-member-info="onShowMemberInfo" />
    <div v-if="unreadMessages.length > 0" class="unread-separator">
      <div class="unread-line"></div>
      <span class="unread-label">NEW</span>
    </div>
    <ChatMessage v-for="(m, index) in unreadMessages" :payload="m" :key="index" @show-member-info="onShowMemberInfo" />
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types.js'
import { useDialogStore } from 'src/stores/dialog-store'

const props = defineProps<{
  messages: ChatMessagePayload[],
  unreadMessages: ChatMessagePayload[],
  channel: Channel | null
}>()

const Dialog = useDialogStore()

function onShowMemberInfo(id: number) {
  if (!props.channel) return
  const member = props.channel.members[id]
  if (member) Dialog.openMemberInfo(member, props.channel)
}
</script>

<style scoped>
.messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  padding: 1rem;
  background: #e7e7e7;
  min-height: 0;
  gap: 0.9rem;
}

.body--dark .messages-container {
  background: #1e1e1e;
}

.unread-separator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.unread-line {
  flex: 1;
  height: 1px;
  background-color: #e03e3e;
  opacity: 0.7;
}

.unread-label {
  background-color: #e03e3e;
  color: white;
  font-weight: 600;
  font-size: 10px;
  border-radius: 3px;
  padding: 2px 6px;
  margin-left: 6px;
  letter-spacing: 0.5px;
}
</style>
