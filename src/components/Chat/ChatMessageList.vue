<template>
  <div ref="container" class="messages-container" @scroll="handleScroll">
    <div v-if="loadingTop" class="top-loader">Loading older messages...</div>
    <div v-else-if="!hasMoreOlder" class="top-info">No older messages</div>

    <ChatMessage v-for="(m, index) in messages" :payload="m" :key="`old-${index}`"
      @show-member-info="onShowMemberInfo" />

    <div v-if="unreadMessages.length > 0" class="unread-separator">
      <div class="unread-line"></div>
      <span class="unread-label">NEW</span>
    </div>

    <ChatMessage v-for="(m, index) in unreadMessages" :payload="m" :key="`new-${index}`"
      @show-member-info="onShowMemberInfo" />

    <TypingIndicator :typingUsers="typingUsers" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import ChatMessage from './ChatMessage.vue'
import TypingIndicator from './TypingIndicator.vue'
import type { ChatMessagePayload, Channel } from 'src/utils/types'
import { useDialogStore } from 'src/stores/dialog-store'
import { useChannelStore } from 'src/stores/channelStore'
import { useChatStore } from 'src/stores/chat-store'

const props = defineProps<{
  messages: ChatMessagePayload[],
  unreadMessages: ChatMessagePayload[],
  channel: Channel | null
}>()

const Dialog = useDialogStore()
const channelStore = useChannelStore()

const container = ref<HTMLElement | null>(null)
const loadingTop = ref(false)
let isPrepending = false

const typingUsers = computed(() => {
  if (!props.channel) return []

  // Extract typing users from member objects
  return Object.values(props.channel.members)
    .filter(member => member.currentlyTyping && member.currentlyTyping.trim().length > 0)
    .map(member => ({
      nickname: member.nickname,
      message: member.currentlyTyping || ''
    }))
})

const hasMoreOlder = computed(() => {
  if (!props.channel) return false
  return channelStore.hasMoreOlder(props.channel.id)
})

function onShowMemberInfo(id: number) {
  console.log(props.messages)
  console.log(props.channel)
  if (!props.channel) return
  const member = props.channel.members[id]
  console.log(member)
  if (member) Dialog.openMemberInfo(member, props.channel)
}

async function loadOlder() {
  if (!props.channel) return
  const el = container.value
  if (!el) return
  loadingTop.value = true
  isPrepending = true

  // // Simulate network delay for loading older messages
  // await new Promise((resolve) => setTimeout(resolve, 600))

  const prevScrollHeight = el.scrollHeight
  const prevScrollTop = el.scrollTop

  // channelStore.fetchOlderMessages(props.channel.id)
  // await nextTick()
  const chatStore = useChatStore()

  if (!chatStore.channel) return
  await channelStore.loadNextMessages(chatStore.channel.id, channelStore.messages.length)

  await nextTick()

  const newScrollHeight = el.scrollHeight
  el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)

  await nextTick()
  isPrepending = false
  loadingTop.value = false
}

function handleScroll(e: Event) {
  const el = e.target as HTMLElement
  if (loadingTop.value || isPrepending) return
  if (el.scrollTop <= 32) void loadOlder()
}

function scrollToBottom() {
  const el = container.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

onMounted(() => {
  void nextTick(() => scrollToBottom())
})

watch(
  () => props.messages.length + props.unreadMessages.length,
  () => {
    if (!isPrepending) void nextTick(() => scrollToBottom())
  }
)
</script>

<style scoped>
.messages-container {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  padding: 1rem;
  background: #e7e7e7;
  min-height: 0;
  gap: 0.9rem;
}

.body--dark .messages-container {
  background: #1e1e1e;
}

.unread-separator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.unread-line {
  flex: 1;
  height: 1px;
  background-color: #e03e3e;
  opacity: 0.7;
}

.unread-label {
  background-color: #e03e3e;
  color: white;
  font-weight: 600;
  font-size: 10px;
  border-radius: 3px;
  padding: 2px 6px;
  margin-left: 6px;
  letter-spacing: 0.5px;
}

.top-loader {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 6px 0 10px 0;
}
</style>
