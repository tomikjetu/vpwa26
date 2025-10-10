<template>
  <div class="q-pa-sm row chat-input-bar">
    <!-- 📎 Attach file button -->
    <q-btn
      flat
      round
      dense
      icon="attach_file"
      color="grey-7"
      @click="attachFile"
    />

    <!-- 💬 Message input -->
    <q-input
      outlined
      dense
      v-model="message"
      placeholder="Type a message..."
      class="col q-mx-sm"
      @keyup.enter="sendMessage"
    >
      <template v-slot:append>
        <!-- Optional emoji or mic button -->
        <q-icon name="mood" class="cursor-pointer" />
      </template>
    </q-input>

    <!-- 📤 Send button -->
    <q-btn
      round
      dense
      color="primary"
      icon="send"
      @click="sendMessage"
      :disable="!message.trim()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')

function sendMessage () {
  if (!message.value.trim()) return
  console.log('Sending:', message.value)
  message.value = ''
}

function attachFile () {
  console.log('Attach file clicked')
}
</script>

<style>
.chat-input-bar {
    flex: 0 0 auto;
}
</style>