<template>
  <div class="chat-container">
    <ChatTopBar :channel="props.channel"></ChatTopBar>
    <ChatMessageList :messages="messages"></ChatMessageList>
    <ChatInput v-if="props.channel" @send="addMessage" ></ChatInput>
  </div>
</template>

<script setup lang="ts">
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatTopBar from './ChatTopBar.vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types.js'
import { useChannelStore } from 'src/stores/channelStore'
import { computed } from 'vue'

const props = defineProps<{
  channel: Channel | null
}>()

const channelStore = useChannelStore()

const messages = computed(() => {
  if (!props.channel) return []
  return channelStore.getMessagesByChannelId(props.channel.id)
})

function addMessage(msg: ChatMessagePayload) {
  if (props.channel) { 
    channelStore.addMessage(msg, props.channel.id)
  }
}
</script>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  border: 1px solid #ddd;
  overflow: hidden;
}
</style>
