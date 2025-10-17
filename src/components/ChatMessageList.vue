<template>
  <div class="messages-container">
    <ChatMessage v-for="(m, index) in messages" :payload="m" :key="index" @show-member-info="onShowMemberInfo" />
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types.js'
import { useDialogStore } from 'src/stores/dialog-store'

const props = defineProps<{
  messages: ChatMessagePayload[],
  channel: Channel | null
}>()

const Dialog = useDialogStore()

function onShowMemberInfo(id: number) {
  if (!props.channel) return
  const member = props.channel.members[id]
  if (member) Dialog.openMemberInfo(member)
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
</style>
