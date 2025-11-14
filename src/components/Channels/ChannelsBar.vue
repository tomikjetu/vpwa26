<template>
  <div class="channels-bar-container">

    <q-input square filled v-model="search" label="Search" type="text" clearable debounce="300"
      class="flat-top q-mt-md q-mb-md channels-search-input">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

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
          <div class="column q-gutter-sm">
            <q-btn :outline="currentStatus !== 'online'" :color="currentStatus === 'online' ? 'positive' : 'grey-7'"
              icon="circle" label="Online" @click="changeStatus('online')" />
            <q-btn :outline="currentStatus !== 'dnd'" :color="currentStatus === 'dnd' ? 'negative' : 'grey-7'"
              icon="do_not_disturb_on" label="Do Not Disturb" @click="changeStatus('dnd')" />
            <q-btn :outline="currentStatus !== 'offline'" :color="currentStatus === 'offline' ? 'grey' : 'grey-7'"
              icon="radio_button_unchecked" label="Offline" @click="changeStatus('offline')" />
          </div>
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
import { useChannelStore } from 'src/stores/channelStore'
import ChannelList from './ChannelList.vue'
import MembersList from './MembersList.vue'
import type { Channel, Member, ChannelInvite } from 'src/utils/types.ts'
import { useChatStore } from 'src/stores/chat-store'
import { useDialogStore } from 'src/stores/dialog-store'
import { msgNotif } from 'src/services/channelService'
import { useAuthStore } from 'src/stores/auth-store'
import { Dark } from 'quasar'
import type { UserStatus } from 'src/utils/types'
import { useContacts } from 'src/stores/contacts-store'

const dialogStore = useDialogStore()
const chatStore = useChatStore()
const auth = useAuthStore()
const contactStore = useContacts()

const search = ref('')
const channelStore = useChannelStore()
const showMembersList = ref(false)
const memberListChannel = ref<Channel | undefined>()


// STATIC NOTIFICATION ================================================
const channel = channelStore.getChannelById(1)
msgNotif('Alice', 'Hello Bob <3', () => { handleSelectChannel(channel) })
// ====================================================================


// Merge and filter lists when searching
const isDark
  = ref<boolean>(Dark.isActive)

// Unified Profile Settings dialog state
const showProfileDialog = ref(false)

// Derived user info
const currentStatus = computed<UserStatus>(() => (auth.getCurrentUser?.status as UserStatus) ?? 'online')
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

function handleSelectChannel(channel: Channel | undefined) {
  if (!channel) return
  if (chatStore.channel) {
    channelStore.markAsRead(chatStore.channel.id)
  }
  chatStore.openChat(channel)
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
  auth.setStatus(s)
  if (!auth.getCurrentUser) return
  contactStore.updateStatus(auth.getCurrentUser.id, s)
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
</style>
