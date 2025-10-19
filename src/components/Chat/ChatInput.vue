<template>
  <div class="q-pa-sm column chat-input-bar">

    <div v-if="selectedFiles.length > 0" class="attached-files row q-gutter-xs q-mb-sm">
      <div v-for="(file, index) in selectedFiles" :key="index" class="file-chip row items-center q-pa-xs q-mr-xs">
        <q-icon name="insert_drive_file" color="blue-6" size="18px" class="q-mr-xs" />
        <span class="file-name ellipsis">{{ file.name }}</span>
        <q-btn flat dense round icon="close" size="sm" color="grey-7" @click="removeFile(index)" />
      </div>
    </div>

    <div class="row items-center">
      <q-btn flat round dense icon="attach_file" color="grey-7" @click="attachFile" />

      <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileSelection" />

      <q-input outlined dense v-model="text" placeholder="Type a message..." class="col q-mx-sm"
        @keyup.enter="sendMessage">
        <template v-slot:append>
          <q-icon name="mood" class="cursor-pointer" />
        </template>
      </q-input>

      <q-btn round dense color="primary" icon="send" @click="sendMessage"
        :disable="!text.trim() && selectedFiles.length === 0" />
    </div>
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
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{
  (e: 'send', msg: ChatMessagePayload): void
}>()

function sendMessage() {
  if (!getCurrentUser.value?.id) return
  if (text.value.trim() || selectedFiles.value.length > 0) {
    emit('send', {
      user: getCurrentUser.value.id,
      text: text.value,
      time: new Date(),
      files: selectedFiles.value,
      userNickname: getCurrentUser.value.nickName
    })
    text.value = ''
    selectedFiles.value = []
  }
}

function attachFile() {
  fileInput.value?.click()
}

function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    // Append new files to existing ones
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)]
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
}
</script>

<style scoped>
.chat-input-bar {
  flex: 0 0 auto;
}

.attached-files {
  flex-wrap: wrap;
}

.file-chip {
  border: 1px solid var(--q-color-grey-4);
  border-radius: 6px;
  background-color: #f9f9f9;
  max-width: 200px;
}

.body--dark .file-chip {
  background-color: #3a3a3a;
}

.file-name {
  font-size: 13px;
  max-width: 120px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>