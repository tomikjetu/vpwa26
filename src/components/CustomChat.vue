<template>
  <div class="chat-container">
    <ChatTopBar></ChatTopBar>
    <MessageList></MessageList>
    <ChattingInput></ChattingInput>
  </div>
</template>

<script setup lang="ts">
import ChattingInput from './ChattingInput.vue'
import MessageList from './MessageList.vue'
import ChatTopBar from './ChatTopBar.vue'
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
