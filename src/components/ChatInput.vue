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
      v-model="text"
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
      :disable="!text.trim()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChatMessagePayload } from 'src/utils/types.js'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const text = ref('')

const emit = defineEmits<{
  (e: 'send', msg: ChatMessagePayload): void
}>()

function sendMessage() {
  if (!getCurrentUser.value?.id) return
  if (text.value.trim()) {
    emit('send', {
      user: getCurrentUser.value?.nickName,
      text: text.value,
      time: new Date().toLocaleTimeString(),
      files: []
    })
    text.value = ''
  }
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