<template>
  <div class="messages-container">
    <ChatMessage v-for="(m, index) in messages" :payload="m" :key="index" />
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import type { ChatMessagePayload } from 'src/utils/types.js'

defineProps<{
  messages: ChatMessagePayload[]
}>()
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
