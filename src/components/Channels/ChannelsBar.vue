<template>
  <div class="channels-bar-container">

    <q-input square filled v-model="search" label="Search" type="text" clearable debounce="300"
      class="flat-top q-mt-md q-mb-md channels-search-input">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div class="console-shortcut-container">
      <span class="console-label">Console</span>
      <kbd class="keyboard-shortcut">CTRL+P</kbd>
    </div>

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
        <ChannelList :channels="channelStore.getJoinedChannels" :channel-invites="channelStore.channelInvites"
          :mode="'joined'" @select-channel="handleSelectChannel" @show-members="handleShowMembers"
          @select-channel-invite="handleChannelInvite" />
        <ChannelList :channels="channelStore.getOwnedChannels" :channel-invites="[]" :mode="'owned'"
          @select-channel="handleSelectChannel" @show-members="handleShowMembers"
          @select-channel-invite="handleChannelInvite" />
      </template>
    </div>
    <div class="profile-footer">
      <q-btn icon="person" round flat size="lg" class="q-ml-sm q-mb-sm" aria-label="Profile"
        @click="openProfileSettings" />
    </div>

    <!-- Unified Profile Settings Dialog -->
    <q-dialog v-model="showProfileDialog">
      <q-card style="min-width: 380px; max-width: 480px">
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
              icon="circle" label="Active" @click="changeStatus('active')" align="left" class="status-btn"
              :disable="!isSocketConnected" />
            <q-btn :outline="currentStatus !== 'dnd'" :color="currentStatus === 'dnd' ? 'negative' : 'grey-7'"
              icon="do_not_disturb_on" label="Do Not Disturb" @click="changeStatus('dnd')" align="left"
              class="status-btn" :disable="!isSocketConnected" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Connection</div>
          <q-btn :color="isSocketConnected ? 'positive' : 'negative'" :icon="isSocketConnected ? 'wifi' : 'wifi_off'"
            :label="isSocketConnected ? 'Connected' : 'Disconnected'" @click="toggleConnection" align="left"
            class="status-btn full-width" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-toggle v-model="isDark" color="primary" label="Dark mode" @update:model-value="setDark" />
        </q-card-section>

        <q-card-actions align="between">
          <q-btn flat label="Close" v-close-popup />
          <q-btn flat color="negative" label="Logout" @click="logoutAndClose" />
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
  border-right: 1px solid rgb(195, 195, 195);
}

.channels-search-input {
  width: 100%;
  flex: 0 0 auto;
}

.console-shortcut-container {
  padding: 0px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.console-label {
  font-size: 14px;
  color: #666;
}

.keyboard-shortcut {
  display: inline-block;
  padding: 4px 8px;
  background-color: #3C6E71;
  border: 1px solid #3C6E71;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.body--dark .console-label {
  color: #aaa;
}


.channels-list-container {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

.profile-footer {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
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
