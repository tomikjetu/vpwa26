<template>
  <div class="channel-list-wrapper">
    <!-- Create/Join Dialog -->
    <q-dialog v-if="mode !== 'all'" v-model="showAddDialog">
      <q-card class="dialog-card rounded-lg">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ mode === 'owned' ? 'Create Channel' : 'Join Channel' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model="newChannelName" :label="mode === 'owned' ? 'Channel name' : 'Enter channel name to join'"
            dense autofocus class="rounded-md" />

          <q-option-group v-if="mode === 'owned'" v-model="isPrivate" :options="[
            { label: 'Public', value: false },
            { label: 'Private', value: true }
          ]" type="radio" inline class="q-mt-md" />

          <div v-if="mode === 'joined'" class="text-caption text-color-muted q-mt-sm">
            Type the name of the channel you want to join. If it's public, you'll be added automatically.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="rounded-md" />
          <q-btn flat :label="mode === 'owned' ? 'Create' : 'Join'" color="primary" @click="confirmAdd"
            class="rounded-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Channel List -->
    <q-scroll-area class="channel-scroll-area">
      <q-list class="q-px-sm">
        <!-- Channel Invites -->
        <q-item v-for="(invite, index) in channelInvs" :key="'invite-' + index" clickable v-ripple
          @click="onChannelInviteClick(invite)" class="channel-item channel-invite rounded-lg q-mb-xs">
          <q-item-section avatar>
            <q-avatar color="amber-6" text-color="white" size="40px" class="rounded-lg">
              <q-icon name="mail" size="20px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="channel-name">
              <q-icon name="circle" color="amber" size="8px" class="blink-icon q-mr-xs" />
              {{ invite.name }}
            </q-item-label>
            <q-item-label caption class="text-color-muted">Invitation pending</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" size="20px" />
          </q-item-section>
        </q-item>

        <!-- Channels -->
        <q-item v-for="(channel, index) in channels" :key="'channel-' + index" clickable v-ripple
          @click="onChannelClick(channel)" class="channel-item rounded-lg q-mb-xs">
          <q-item-section avatar>
            <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" size="40px" class="rounded-lg" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="channel-name">
              <q-icon v-if="channel.hasUnreadMsgs" name="circle" color="primary" size="8px" class="q-mr-xs" />
              {{ channel.name }}
              <q-icon v-if="channel.isPrivate" name="lock" size="12px" color="grey-6" class="q-ml-xs" />
            </q-item-label>
            <q-item-label caption class="text-color-muted">
              {{ channel.members ? Object.keys(channel.members).length : 0 }} members
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round dense size="sm" icon="more_vert" color="grey-6" @click.stop>
              <ChannelDropdown :items="getMenuOptions(channel)" :channels="channels" :channel="channel"
                @show-members="onShowMembers" />
            </q-btn>
          </q-item-section>
        </q-item>

        <!-- Empty state -->
        <div v-if="channels.length === 0 && channelInvs.length === 0" class="empty-state q-pa-xl text-center">
          <q-icon :name="mode === 'owned' ? 'add_circle_outline' : 'group'" size="56px" color="grey-4" />
          <p class="text-color-muted q-mt-md q-mb-none">
            {{ mode === 'owned' ? 'Create your first channel' : 'Join a channel to get started' }}
          </p>
        </div>
      </q-list>
    </q-scroll-area>

    <!-- Floating Action Button -->
    <q-btn v-if="mode !== 'all'" fab :icon="mode === 'owned' ? 'add' : 'group_add'" color="primary" class="fab-action"
      @click="onAddClick" />
  </div>
</template>

<script setup lang="ts">
import type { Channel, ChannelInvite } from 'src/utils/types'
import ChannelDropdown from './ChannelDropdown.vue'
import { useAuthStore } from 'src/stores/auth'
import { useChannelStore } from 'src/stores/channel'
import { storeToRefs } from 'pinia'
import { toRef, ref } from 'vue'
import { getMenuOptions } from 'src/composables/useChannelList'

// ---------- Props ----------
const props = defineProps<{
  channelInvites: ChannelInvite[]
  channels: Channel[]
  mode: 'owned' | 'joined' | 'all'
}>()

// ---------- Setup ----------
const channelInvs = toRef(props, 'channelInvites')
const channels = toRef(props, 'channels')
const authStore = useAuthStore()
const channelStore = useChannelStore()
const { getCurrentUser } = storeToRefs(authStore)

const showAddDialog = ref(false)
const newChannelName = ref('')
const isPrivate = ref(true)

// ---------- Methods ----------
function onAddClick(): void {
  showAddDialog.value = true
}

function confirmAdd(): void {
  if (!newChannelName.value.trim()) return
  if (!getCurrentUser.value) return

  if (props.mode === 'owned') {
    channelStore.createChannelAction(newChannelName.value.trim(), isPrivate.value)
  } else if (props.mode === 'joined') {
    channelStore.joinChannelAction(newChannelName.value.trim())
  } else {
    return
  }

  newChannelName.value = ''
  isPrivate.value = false
  showAddDialog.value = false
}

// ---------- Emits ----------
const emit = defineEmits<{
  (e: 'select-channel', channel: Channel): void
  (e: 'show-members', channel: Channel): void
  (e: 'select-channel-invite', invite: ChannelInvite): void
}>()

function onChannelClick(channel: Channel) {
  emit('select-channel', channel)
}

function onChannelInviteClick(invite: ChannelInvite) {
  emit('select-channel-invite', invite)
}

function onShowMembers(channel: Channel) {
  emit('show-members', channel)
}
</script>

<style scoped>
.channel-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.channel-scroll-area {
  flex: 1;
  min-height: 0;
}

.channel-item {
  transition: background-color 0.2s ease;
  min-height: 56px;
}

.channel-item:hover {
  background: var(--bg-tertiary);
}

.channel-name {
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.channel-invite {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
}

.body--dark .channel-invite {
  background: linear-gradient(135deg, rgba(251, 192, 45, 0.15) 0%, rgba(255, 213, 79, 0.1) 100%);
}

.dialog-card {
  min-width: 350px;
  background: var(--bg-surface);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.fab-action {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 10;
}

/* Blink animation for notifications */
@keyframes blink {

  0%,
  50%,
  100% {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0.4;
  }
}

.blink-icon {
  animation: blink 2s ease-in-out infinite;
}
</style>
