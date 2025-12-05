<template>
  <div class="channels-bar-container">
    <!-- Profile header section -->
    <div class="profile-header">
      <div class="row items-center q-gutter-sm cursor-pointer profile-info" @click="openProfileSettings">
        <q-avatar icon="person" color="primary" text-color="white" size="40px" class="rounded-full" />
        <div class="column">
          <div class="text-subtitle1 text-weight-medium text-color-primary">{{ displayName }}</div>
          <div class="text-caption text-color-muted">
            <q-icon :name="currentStatus === 'active' ? 'circle' : 'do_not_disturb_on'"
              :color="currentStatus === 'active' ? 'positive' : 'negative'" size="10px" class="q-mr-xs" />
            {{ currentStatus === 'active' ? 'Active' : 'Do Not Disturb' }}
          </div>
        </div>
        <q-space />
        <q-icon class="settings-icon" name="settings" size="20px" color="grey-6" />
      </div>
    </div>

    <!-- Search input -->
    <div class="search-section q-px-md">
      <q-input v-model="search" placeholder="Search channels..." type="text" clearable debounce="300" dense rounded
        outlined class="search-input">
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>
    </div>

    <!-- Console shortcut -->
    <div class="console-shortcut-container q-px-md q-mb-sm">
      <span class="console-label">Console</span>
      <kbd class="keyboard-shortcut">CTRL+P</kbd>
    </div>

    <!-- Channels tabs -->
    <div class="channels-tabs-wrapper q-px-md q-mb-sm" v-if="!showMembersList && (search ?? '').trim() === ''">
      <q-tabs v-model="activeTab" dense class="channel-tabs" active-color="primary" indicator-color="primary"
        narrow-indicator>
        <q-tab name="joined" label="Joined" class="channel-tab" />
        <q-tab name="owned" label="My Channels" class="channel-tab" />
      </q-tabs>
    </div>

    <!-- Channels list container -->
    <div class="channels-list-container">
      <template v-if="showMembersList">
        <MembersList :channel="memberListChannel" :members="membersListContent" @cancel="handleCancelMembersList">
        </MembersList>
      </template>

      <template v-else-if="(search ?? '').trim() !== ''">
        <ChannelList :channels="filteredAll" :channel-invites="channelStore.channelInvites" :mode="'all'"
          @select-channel="handleSelectChannel" @show-members="handleShowMembers"
          @select-channel-invite="handleChannelInvite" />
      </template>

      <template v-else>
        <q-tab-panels v-model="activeTab" animated class="channel-tab-panels">
          <q-tab-panel name="joined" class="q-pa-none">
            <ChannelList :channels="channelStore.getJoinedChannels" :channel-invites="channelStore.channelInvites"
              :mode="'joined'" @select-channel="handleSelectChannel" @show-members="handleShowMembers"
              @select-channel-invite="handleChannelInvite" />
          </q-tab-panel>
          <q-tab-panel name="owned" class="q-pa-none">
            <ChannelList :channels="channelStore.getOwnedChannels" :channel-invites="[]" :mode="'owned'"
              @select-channel="handleSelectChannel" @show-members="handleShowMembers"
              @select-channel-invite="handleChannelInvite" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </div>

    <!-- Unified Profile Settings Dialog -->
    <q-dialog v-model="showProfileDialog">
      <q-card class="profile-dialog-card rounded-lg">
        <q-card-section class="text-h6">Profile Settings</q-card-section>

        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <q-avatar icon="person" color="primary" text-color="white" />
            <div class="column">
              <div class="text-subtitle1">{{ displayName }}</div>
              <div class="text-caption text-grey-7">{{ displayEmail }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Status</div>
          <div class="column q-gutter-sm status-buttons-container">
            <q-btn :outline="currentStatus !== 'active'" :color="currentStatus === 'active' ? 'positive' : 'grey-7'"
              icon="circle" label="Active" @click="changeStatus('active')" align="left" class="status-btn rounded-md"
              :disable="!isSocketConnected" />
            <q-btn :outline="currentStatus !== 'dnd'" :color="currentStatus === 'dnd' ? 'negative' : 'grey-7'"
              icon="do_not_disturb_on" label="Do Not Disturb" @click="changeStatus('dnd')" align="left"
              class="status-btn rounded-md" :disable="!isSocketConnected" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Connection</div>
          <q-btn :color="isSocketConnected ? 'positive' : 'negative'" :icon="isSocketConnected ? 'wifi' : 'wifi_off'"
            :label="isSocketConnected ? 'Connected' : 'Disconnected'" @click="toggleConnection" align="left"
            class="status-btn full-width rounded-md" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-toggle v-model="isDark" color="primary" label="Dark mode" @update:model-value="setDark" />
        </q-card-section>

        <q-card-actions align="between">
          <q-btn flat label="Close" v-close-popup class="rounded-md" />
          <q-btn flat color="negative" label="Logout" @click="logoutAndClose" class="rounded-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannelStore } from 'src/stores/channel'
import ChannelList from './ChannelList.vue'
import MembersList from './MembersList.vue'
import type { Channel, Member, ChannelInvite } from 'src/utils/types.ts'
import { useChatStore } from 'src/stores/chat'
import { useDialogStore } from 'src/stores/dialog'
import { useAuthStore } from 'src/stores/auth'
import { Dark } from 'quasar'
import type { UserStatus } from 'src/utils/types'
import { useContacts } from 'src/stores/contacts'
import { disconnectSocket, reconnectSocket, isSocketConnected } from 'src/services/socketService'

const emit = defineEmits<{
  channelSelected: []
}>()

const dialogStore = useDialogStore()
const chatStore = useChatStore()
const auth = useAuthStore()
const contactStore = useContacts()

const search = ref('')
const channelStore = useChannelStore()
const showMembersList = ref(false)
const memberListChannel = ref<Channel | undefined>()
const activeTab = ref('joined')

// Merge and filter lists when searching
const isDark
  = ref<boolean>(Dark.isActive)

// Unified Profile Settings dialog state
const showProfileDialog = ref(false)

// Derived user info
const currentStatus = computed<UserStatus>(() => (auth.getCurrentUser?.status as UserStatus) ?? 'active')
const displayName = computed(() => {
  const u = auth.getCurrentUser
  if (!u) return 'Guest'
  return u.nickName || `${u.name} ${u.surname}`
})
const displayEmail = computed(() => auth.getCurrentUser?.email ?? '')

// Merge and filter lists when searching
const filteredAll = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return channelStore.channels

  // Adjust these field names to match your Channel type
  return channelStore.channels.filter((channel: Channel) =>
    channel.name.toLowerCase().includes(term) ||
    (channel.description?.toLowerCase().includes(term) ?? false)
  )
})

async function handleSelectChannel(channel: Channel | undefined) {
  if (!channel) return
  if (chatStore.channel) {
    channelStore.markAsRead(chatStore.channel.id)
  }
  await chatStore.openChat(channel)
  emit('channelSelected')
}

const membersListContent = ref<Member[]>([])

function handleShowMembers(channel: Channel) {

  showMembersList.value = true
  membersListContent.value = Object.values(channel.members)
  memberListChannel.value = channel
}

function handleCancelMembersList() {
  showMembersList.value = false
}

function handleChannelInvite(channelInvite: ChannelInvite) {
  dialogStore.openChannelInviteAcceptation(channelInvite)
}


function openProfileSettings() {
  showProfileDialog.value = true
}

function setDark(val: boolean) {
  Dark.set(val)
  isDark.value = Dark.isActive
}

function changeStatus(s: UserStatus) {
  contactStore.changeStatus(s)
}

function toggleConnection() {
  if (isSocketConnected.value) {
    disconnectSocket()
    chatStore.closeChat()
  } else {
    reconnectSocket()
  }
}

async function logoutAndClose() {
  const auth = useAuthStore();
  await auth.logout();
  showProfileDialog.value = false
  window.location.href = '/auth/login'
}
</script>



<style scoped>
.channels-bar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  background: var(--sidebar-bg);
}

/* Profile header section */
.profile-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--profile-bg);
  flex: 0 0 auto;
}

.profile-header .q-avatar {
  margin: 0;
}

.text-subtitle1 {
  line-height: 0.8;
}

.settings-icon {
  margin: 0
}

.profile-info {
  border-radius: 12px;
  padding: 8px;
  transition: background-color 0.2s ease;
}

.profile-info:hover {
  background: var(--bg-tertiary);
}

/* Search section */
.search-section {
  padding-top: 12px;
  padding-bottom: 8px;
  flex: 0 0 auto;
}

.search-input {
  background: var(--bg-surface);
}

.search-input :deep(.q-field__control) {
  border-radius: 20px !important;
}

.console-shortcut-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding-bottom: 8px;
}

.console-label {
  font-size: 13px;
  color: var(--text-muted);
}

.keyboard-shortcut {
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--q-primary);
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.body--dark .keyboard-shortcut {
  color: #1a1a1e;
}

/* Channel tabs */
.channels-tabs-wrapper {
  flex: 0 0 auto;
}

.channel-tabs {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 4px;
}

.channel-tabs :deep(.q-tabs__content) {
  gap: 4px;
}

.channel-tab {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 13px;
  min-height: 36px;
  transition: background 0.2s ease;
}

.channel-tab:hover {
  background: var(--bg-elevated);
}

.channel-tabs :deep(.q-tab--active) {
  background: var(--bg-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.channel-tab-panels {
  flex: 1;
  background: transparent;
  overflow: hidden;
}

.channel-tab-panels :deep(.q-panel) {
  overflow: auto;
}

/* Channels list container */
.channels-list-container {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

/* Profile dialog */
.profile-dialog-card {
  min-width: 380px;
  max-width: 480px;
  background: var(--bg-surface);
}

.status-buttons-container {
  display: flex;
  align-items: center;
}

.status-btn {
  width: 100%;
  justify-content: flex-start;
}

.status-btn :deep(.q-btn__content) {
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
  justify-content: flex-start;
}
</style>
