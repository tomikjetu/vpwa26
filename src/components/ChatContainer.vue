<template>
  <div class="chat-container">
    <ChatTopBar></ChatTopBar>
    <ChatMessageList></ChatMessageList>
    <ChatInput></ChatInput>
  </div>
</template>

<script setup lang="ts">
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
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
