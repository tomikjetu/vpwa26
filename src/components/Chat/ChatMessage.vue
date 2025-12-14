<template>
  <div class="message-wrapper" :class="{ 'message-own': isOwnMessage, 'message-other': !isOwnMessage }">
    <!-- Avatar for other users -->
    <q-avatar v-if="!isOwnMessage" size="32px" class="message-avatar" color="grey-4">
      <q-icon name="person" color="grey-7" size="18px" />
    </q-avatar>

    <div class="message-content">
      <!-- Sender name for other users -->
      <div v-if="!isOwnMessage" class="message-sender" @click="$emit('show-member-info', payload.user)">
        {{ payload.userNickname }}
      </div>

      <!-- Message bubble -->
      <div class="message-bubble" :class="{
        'own': isOwnMessage,
        'mention': messageContainsMention(payload.text)
      }">
        <!-- Message text -->
        <div v-if="payload.text != ''" class="message-text" v-html="replaceMentions(payload.text)"></div>

        <!-- Attachments -->
        <div v-if="payload.files && payload.files.length" class="message-attachments">
          <div v-for="(file, index) in payload.files" :key="'file-' + index"
            @click="downloadAttachment(getFileURL(file), file.name)" class="attachment-link">
            <q-icon name="attach_file" size="14px" />
            <span>{{ getFileName(file) }}</span>
          </div>
        </div>

        <!-- Footer with time and status -->
        <div class="message-footer">
          <span class="message-time">{{ formatTime(payload.time) }}</span>
          <q-icon v-if="isOwnMessage" name="done_all" size="14px" class="read-indicator" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';
import type { Channel, ChatMessageFile, ChatMessagePayload } from 'src/utils/types'
import { api } from 'src/boot/axios';

const auth = useAuthStore()
const chatStore = useChatStore()

const props = defineProps<{
  payload: ChatMessagePayload,
  channel: Channel | null
}>()

async function downloadAttachment(path: string, filename: string) {
  const urlPath = path.startsWith('/') ? path : `/${path}`

  const res = await api.get(urlPath, { responseType: 'blob' })

  const blob = new Blob([res.data], {
    type: res.headers['content-type'] || 'application/octet-stream',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const isOwnMessage = computed(() => {
  return auth.getCurrentUser?.id === props.channel?.members[props.payload.user]?.userId
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getFileURL(file: ChatMessageFile): string {
  return file.path
}

function getFileName(file: ChatMessageFile): string {
  return file.name
}

function messageContainsMention(message: string) {
  if (!auth.getCurrentUser) return
  if (!props.channel) return

  const ids: number[] = []
  const re = /@(\d+)/g

  let match: RegExpExecArray | null
  while ((match = re.exec(message)) !== null) {
    const n = Number.parseInt(match[1] ? match[1] : '', 10)
    if (Number.isFinite(n)) ids.push(n)
  }
  console.log(ids)
  for (const id of ids) {
    const mentioned_member = props.channel.members[id]
    if (!mentioned_member) continue
    console.log(mentioned_member)
    if (auth.getCurrentUser.id === mentioned_member.userId) {
      return true
    }
  }
  return false
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
.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  max-width: 100%;
}

.message-own {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 20px;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 120px;
}

.message-sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 2px;
  margin-left: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.message-sender:hover {
  color: var(--q-primary);
}

.message-bubble {
  position: relative;
  padding: 10px 14px;
  padding-bottom: 20px;
  border-radius: 18px;
  background: var(--msg-other-bg);
  color: var(--msg-other-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.message-bubble.own {
  background: var(--msg-own-bg);
  color: var(--msg-own-text);
  border-bottom-right-radius: 4px;
}

.message-bubble:not(.own) {
  border-bottom-left-radius: 4px;
}

.message-bubble.mention {
  background: linear-gradient(135deg, #6b4e00 0%, #c07a00 100%);
  color: #ffffff;
  border-left: 3px solid #ffdf7e;
}

.body--dark .message-bubble.mention {
  background: linear-gradient(135deg, rgba(251, 192, 45, 0.15) 0%, rgba(255, 213, 79, 0.1) 100%);
  color: #f0f0f5;
  border-left: 3px solid #fbc02d;
}

.message-text {
  font-size: 14px;
  line-height: 1.45;
  word-wrap: break-word;
  white-space: pre-wrap;
}

:deep(.message-text .mention-part) {
  background-color: rgba(251, 192, 45, 0.35);
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 500;
}

.message-attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  font-size: 12px;
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease;
  cursor: pointer;
}

.attachment-link span,
.attachment-link i {
  color: white;
}

.attachment-link:hover {
  background: rgba(0, 0, 0, 0.1);
}

.message-bubble.own .attachment-link {
  background: rgba(255, 255, 255, 0.15);
}

.message-bubble.own .attachment-link:hover {
  background: rgba(255, 255, 255, 0.25);
}

.message-bubble.own .message-text {
  color: white;
}

.message-bubble.own .message-time {
  color: #ccc;
}

.message-footer {
  position: absolute;
  bottom: 6px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-time {
  font-size: 10px;
  opacity: 0.6;
}

.read-indicator {
  opacity: 0.7;
  color: #4fc3f7;
}

.message-bubble.own .read-indicator {
  color: rgba(255, 255, 255, 0.7);
}
</style>
