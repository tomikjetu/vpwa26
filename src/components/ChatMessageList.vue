<template>
  <div class="messages-container">
    <Message v-for="n in 2" :key="n" :name="'Name ' + n"  :date="'2025-10-' + n" text="Hello, This is the message text. Hooraaaaayyyy!">
    </Message>
  </div>
</template>

<script setup lang="ts">
import Message from './ChatMessage.vue'
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
