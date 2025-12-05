<template>
  <div class="q-pa-sm column chat-input-bar">

    <div v-if="selectedFiles.length > 0" class="attached-files row q-gutter-xs q-mb-sm">
      <div v-for="(file, index) in selectedFiles" :key="index" class="file-chip row items-center q-pa-xs q-mr-xs">
        <q-icon name="insert_drive_file" color="blue-6" size="18px" class="q-mr-xs" />
        <span class="file-name ellipsis">{{ file.name }}</span>
        <q-btn flat dense round icon="close" size="sm" color="grey-7" @click="removeFile(index)" />
      </div>
    </div>

    <!-- Reserved space for typing indicator (always present to avoid layout shift) -->
    <div class="typing-area">
      <TypingIndicator v-if="typingUsers.length > 0" :typingUsers="typingUsers" />
    </div>

    <div class="row items-center input-wrapper">
      <q-btn flat round dense icon="attach_file" color="grey-7" @click="attachFile" />

      <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileSelection" />

      <q-input ref="inputRef" outlined dense v-model="text" placeholder="Type a message..." class="col q-mx-sm"
        @update:model-value="onInputUpdate" @keydown="handleKeyDown">
      </q-input>

      <q-btn round dense color="primary" icon="send" @click="sendMessage"
        :disable="!text.trim() && selectedFiles.length === 0" />

      <!-- Mention dropdown -->
      <div v-if="showMentionDropdown" class="mention-dropdown">
        <div v-for="member in filteredMembers" :key="member.id" class="mention-item"
          :class="{ 'mention-item-selected': member.id === selectedMemberIndex }" @click="selectMember(member)"
          @mouseenter="selectedMemberIndex = member.id">
          <q-avatar color="primary" text-color="white" size="24px" class="q-mr-sm">
            <q-icon name="person" size="16px" />
          </q-avatar>
          <span class="mention-nickname">{{ member.nickname }}</span>
          <span class="mention-id text-grey-6">(ID: {{ member.id }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import TypingIndicator from './TypingIndicator.vue'
import type { ChatMessagePayload, Member } from 'src/utils/types'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { useChatStore } from 'src/stores/chat'
import { useChannelStore } from 'src/stores/channel'
import type { QInput } from 'quasar'

const authStore = useAuthStore()
const chatStore = useChatStore()
const channelStore = useChannelStore()
const { getCurrentUser } = storeToRefs(authStore)

const text = ref('')
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const inputRef = ref<QInput | null>(null)

// Mention autocomplete
const showMentionDropdown = ref(false)
const mentionStartPos = ref(-1)
const mentionQuery = ref('')
const selectedMemberIndex = ref<number | null>(null)

const emit = defineEmits<{
  (e: 'send', msg: ChatMessagePayload, files: File[]): void
}>()

const channelMembers = computed(() => {
  const channel = chatStore.channel
  if (!channel || !channel.members) return []
  return Object.values(channel.members)
})

const typingUsers = computed(() => {
  const channel = chatStore.channel
  if (!channel || !channel.members) return []
  return Object.values(channel.members)
    .filter((member: Member) => member.currentlyTyping && member.currentlyTyping.trim().length > 0)
    .map((member: Member) => ({ nickname: member.nickname, message: member.currentlyTyping || '' }))
})

const filteredMembers = computed(() => {
  if (!mentionQuery.value) return channelMembers.value
  const query = mentionQuery.value.toLowerCase()
  return channelMembers.value.filter(member =>
    member.nickname.toLowerCase().includes(query) ||
    String(member.id).includes(query)
  )
})

const emitTyping = (channelId: number, message: string) => {
  channelStore.sendTypingAction(channelId, message)
}

// Clear typing indicator on channel change
watch(() => chatStore.channel?.id, (newId, oldId) => {
  if (oldId && text.value.length > 0) {
    channelStore.sendTypingAction(oldId, '')
  }
  text.value = ''
  selectedFiles.value = []
})

// Cleanup on unmount
onUnmounted(() => {
  if (chatStore.channel && text.value.length > 0) {
    channelStore.sendTypingAction(chatStore.channel.id, '')
  }
})

function sendMessage() {
  if (!getCurrentUser.value?.id) return
  if (text.value.trim() || selectedFiles.value.length > 0) {

    // Clear typing indicator before sending
    if (chatStore.channel) {
      channelStore.sendTypingAction(chatStore.channel.id, '')
    }

    // Extract file names
    const file_names: string[] = []
    for (const file of selectedFiles.value) {
      file_names.push(file.name)
    }

    emit('send', {
      user: getCurrentUser.value.id,
      text: text.value,
      time: new Date(),
      files: file_names,
      userNickname: getCurrentUser.value.nickName
    }, selectedFiles.value)
    text.value = ''
    selectedFiles.value = []
    showMentionDropdown.value = false
    mentionStartPos.value = -1
  }
}

const onInputUpdate = (value: string | number | null) => {
  text.value = value == null ? '' : String(value)
  checkForMention()

  // Emit typing indicator
  if (chatStore.channel) {
    emitTyping(chatStore.channel.id, text.value)
  }
}

function checkForMention() {
  const cursorPos = getCursorPosition()
  if (cursorPos === -1) return

  // Look backwards from cursor to find @ symbol
  const textBeforeCursor = text.value.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex === -1) {
    showMentionDropdown.value = false
    mentionStartPos.value = -1
    return
  }

  // Check if there's a space between @ and cursor (means mention was completed)
  const textBetween = textBeforeCursor.substring(lastAtIndex)
  if (textBetween.includes(' ') && textBetween.length > 1) {
    showMentionDropdown.value = false
    mentionStartPos.value = -1
    return
  }

  // Extract query after @
  mentionStartPos.value = lastAtIndex
  mentionQuery.value = textBeforeCursor.substring(lastAtIndex + 1)
  showMentionDropdown.value = true

  // Select first member by default
  if (filteredMembers.value.length > 0 && filteredMembers.value[0]) {
    selectedMemberIndex.value = filteredMembers.value[0].id
  }
}

function getCursorPosition(): number {
  const input = inputRef.value?.getNativeElement?.() as HTMLInputElement | undefined
  if (!input) return -1
  return input.selectionStart ?? -1
}

function selectMember(member: { id: number; nickname: string }) {
  if (mentionStartPos.value === -1) return

  // Replace @query with @id
  const before = text.value.substring(0, mentionStartPos.value)
  const cursorPos = getCursorPosition()
  const after = text.value.substring(cursorPos)

  text.value = `${before}@${member.id} ${after}`

  showMentionDropdown.value = false
  mentionStartPos.value = -1
  mentionQuery.value = ''
  selectedMemberIndex.value = null

  // Focus back on input
  const input = inputRef.value?.getNativeElement?.() as HTMLInputElement | undefined
  if (input) {
    const newPos = before.length + String(member.id).length + 2
    input.focus()
    input.setSelectionRange(newPos, newPos)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (!showMentionDropdown.value) {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const currentIndex = filteredMembers.value.findIndex(m => m.id === selectedMemberIndex.value)
    const nextMember = filteredMembers.value[currentIndex + 1]
    if (currentIndex < filteredMembers.value.length - 1 && nextMember) {
      selectedMemberIndex.value = nextMember.id
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const currentIndex = filteredMembers.value.findIndex(m => m.id === selectedMemberIndex.value)
    const prevMember = filteredMembers.value[currentIndex - 1]
    if (currentIndex > 0 && prevMember) {
      selectedMemberIndex.value = prevMember.id
    }
  } else if (event.key === 'Enter' && selectedMemberIndex.value !== null) {
    event.preventDefault()
    const member = filteredMembers.value.find(m => m.id === selectedMemberIndex.value)
    if (member) {
      selectMember(member)
    }
  } else if (event.key === 'Escape') {
    showMentionDropdown.value = false
    mentionStartPos.value = -1
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

.input-wrapper {
  position: relative;
}

.typing-area {
  height: 36px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 12px;
  pointer-events: none;
  box-sizing: border-box;
}

.attached-files {
  flex-wrap: wrap;
}

.file-chip {
  border: 1px solid var(#cfcfcf);
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

/* Mention dropdown styles */
.mention-dropdown {
  position: absolute;
  bottom: 100%;
  left: 48px;
  right: 48px;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-bottom: 8px;
}

.body--dark .mention-dropdown {
  background-color: #2c2c2c;
  border-color: #444;
}

.mention-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.body--dark .mention-item {
  border-bottom-color: #3a3a3a;
}

.mention-item:last-child {
  border-bottom: none;
}

.mention-item:hover,
.mention-item-selected {
  background-color: #f5f5f5;
}

.body--dark .mention-item:hover,
.body--dark .mention-item-selected {
  background-color: #3a3a3a;
}

.mention-nickname {
  font-weight: 500;
  margin-right: 8px;
}

.mention-id {
  font-size: 12px;
  margin-left: auto;
}

/* Scrollbar styling for mention dropdown */
.mention-dropdown::-webkit-scrollbar {
  width: 6px;
}

.mention-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.mention-dropdown::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.mention-dropdown::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

.body--dark .mention-dropdown::-webkit-scrollbar-thumb {
  background: #555;
}

.body--dark .mention-dropdown::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
