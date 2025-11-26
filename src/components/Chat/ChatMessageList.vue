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

    <div v-if="typingMembers.length > 0" class="typing-indicator">
      <q-avatar size="24px" icon="more_horiz" color="grey-5" text-color="white" class="q-mr-sm" />
      <span class="typing-text">{{ typingLabel }}</span>
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed, type ComputedRef } from 'vue'
import ChatMessage from './ChatMessage.vue'
import type { ChatMessagePayload, Channel, Member } from 'src/utils/types'
import { useDialogStore } from 'src/stores/dialog-store'
import { useChannelStore } from 'src/stores/channelStore'
import { useAuthStore } from 'src/stores/auth-store'
import { useChatStore } from 'src/stores/chat-store'

const props = defineProps<{
  messages: ChatMessagePayload[],
  unreadMessages: ChatMessagePayload[],
  channel: Channel | null
}>()

const Dialog = useDialogStore()
const channelStore = useChannelStore()
const auth = useAuthStore()

const container = ref<HTMLElement | null>(null)
const loadingTop = ref(false)
let isPrepending = false

function isMemberTyping(m: Member): boolean {
  const v = m.currentlyTyping
  return typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
}

const typingMembers: ComputedRef<Member[]> = computed(() => {
  if (!props.channel) return []
  const selfId = auth.getCurrentUser?.id
  return Object.values(props.channel.members)
    .filter(m => isMemberTyping(m) && m.id !== selfId)
})

const typingLabel = computed(() => {
  const list = typingMembers.value
  const n = list.length
  if (n === 1 && list[0]) return `${list[0].nickname} is typing`
  return `${n} people are typing`
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

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.body--dark .typing-indicator {
  color: #aaa;
}

.typing-indicator .dot {
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.6;
  animation: typing-blink 1.2s infinite ease-in-out;
}

.typing-indicator .dot:nth-of-type(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-of-type(3) {
  animation-delay: 0.4s;
}

@keyframes typing-blink {

  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }

  40% {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}
</style>
