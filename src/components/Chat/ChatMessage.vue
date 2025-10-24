<template>
  <div class='message-card q-mb-sm' :class="messageContainsMention(payload.text) ? 'mention' : null">
    <!-- Header -->
    <div class="row justify-between items-start message-header">
      <!-- Left side: icon + name -->
      <div class="row items-center clickable-name" @click="$emit('show-member-info', payload.user)">
        <q-avatar color="primary" text-color="white" size="32px" class="q-mr-sm">
          <q-icon name="person" />
        </q-avatar>

        <!-- 🔹 Clickable name -->
        <div class="text-bold">
          {{ payload.userNickname }}
        </div>
      </div>

      <!-- Right side: date -->
      <div class="text-caption text-grey-7">
        {{ payload.time.toDateString() }}
      </div>
    </div>

    <!-- Message text -->
    <div v-if="payload.text != ''" class="q-mt-xs text-body2 message-body" v-html="replaceMentions(payload.text)">
    </div>

    <!-- 📎 Attached files -->
    <div v-if="payload.files && payload.files.length" class="attachments q-mt-sm">
      <div v-for="(file, index) in payload.files" :key="'file-' + index"
        class="file-chip row items-center q-pa-xs q-my-xs">
        <q-icon name="insert_drive_file" color="grey-8" class="q-mr-xs" />
        <a :href="getFileURL(file)" target="_blank" class="file-name">
          {{ typeof file === 'string' ? file.split('/').pop() : file.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth-store';
import { useChatStore } from 'src/stores/chat-store';
import type { ChatMessagePayload } from 'src/utils/types'

const auth = useAuthStore()
const chatStore = useChatStore()

defineProps<{
  payload: ChatMessagePayload
}>()

/** Return file URL or object URL for locally attached files */
function getFileURL(file: File | string): string {
  if (typeof file === 'string') {
    return file // e.g., a URL from your backend
  }
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return ''
}

function messageContainsMention(message: string) {
  const id = auth.getCurrentUser?.id;
  return message.includes(`@${id}`)
}

function replaceMentions(message: string) {
  if (!message) return ''

  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  const escapeHtml = (s: string) =>
    s.replace(/[&<>"']/g, c => map[c] ?? '')

  const escaped = escapeHtml(message)
  const mentionRegex = /@(\d+)/g
  const formatMention = (id: string) => {
    const channel = chatStore.channel;
    if (!channel) return `<span class='mention-part'>@${id}</span>`;
    const members = channel?.members;
    const member = members ? Object.values(members).find(m => String(m.id) === id) : null;
    if (!member) return `<span class='mention-part'>@${id}</span>`;

    return `<span class='mention-part'>@${member.nickname}</span>`
  }

  return escaped.replace(mentionRegex, (_match, id) => formatMention(id))
}

</script>

<style scoped>
.message-card {
  width: 100%;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.body--dark .message-card {
  background-color: #2c2c2c;
}

.message-card.mention {
  background-color: #fff494;
  border-left: 4px solid #ffeb3b;
}

.body--dark .message-card.mention {
  color: black;
}

.message-header {
  padding: 0.4rem;
}

.message-body {
  border-top: 1px solid rgb(204, 204, 204);
  padding: 0.8rem;
  padding-bottom: 0.4rem;
}

/* v-html inserts raw HTML which isn't affected by scoped styles by default.
     Use the deep selector so the injected .mention-part is styled when <style scoped> is used. */
:deep(.message-body .mention-part) {
  background-color: #ffebee;
  color: #b71c1c;
  padding: 0 4px;
  border-radius: 4px;
}

.body--dark .message-body {
  border-color: #444
}

.clickable-name {
  cursor: pointer;
  color: var(--q-color-primary);
  transition: color 0.2s ease;
}

.clickable-name:hover {
  color: var(--q-color-primary-light);
  text-decoration: underline;
}

/* 📎 File list styling */
.attachments {
  border-top: 1px solid rgb(220, 220, 220);
  padding-top: 0.4rem;
  margin-top: 0.4rem;
}

.file-chip {
  background-color: #f1f1f1;
  border-radius: 6px;
  padding: 4px 8px;
  display: inline-flex;
  max-width: 100%;
}

.body--dark .attachments {
  border-color: #444;
}

.body--dark .file-chip {
  background-color: #3a3a3a;
}

.file-name {
  font-size: 14px;
  color: var(--q-color-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.file-name:hover {
  text-decoration: underline;
}
</style>