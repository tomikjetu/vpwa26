<template>
  <q-item-label header class="row items-center justify-between">
    <span class="section-title">{{ headerTitle }}</span>

    <!-- Action button for 'owned' or 'joined' -->
    <q-btn v-if="mode !== 'all'" flat dense color="primary" :icon="mode === 'owned' ? 'add' : 'add'"
      :label="mode === 'owned' ? 'Create' : 'Join'" size="sm" @click="onAddClick" />
  </q-item-label>

  <!-- Owned / Joined Dialog -->
  <q-dialog v-if="mode !== 'all'" v-model="showAddDialog">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ mode === 'owned' ? 'Create Channel' : 'Join Channel' }}
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input v-model="newChannelName" :label="mode === 'owned' ? 'Channel name' : 'Enter channel name to join'"
          dense autofocus />

        <!-- Only show public/private options for owned channels -->
        <q-option-group v-if="mode === 'owned'" v-model="isPublic" :options="[
          { label: 'Public', value: true },
          { label: 'Private', value: false }
        ]" type="radio" inline class="q-mt-md" />

        <!-- Info for joined channels -->
        <div v-if="mode === 'joined'" class="text-caption text-grey q-mt-sm">
          Type the name of the channel you want to join.
          If it’s public, you’ll be added automatically.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat :label="mode === 'owned' ? 'Create' : 'Join'" color="primary" @click="confirmAdd" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Channel List -->
  <q-scroll-area :style="'flex: ' + (mode == 'owned' ? '1' : '2')">
    <q-list padding>
      <q-item v-for="(invite, index) in channelInvs" :key="'channel-invs' + index" clickable v-ripple
        @click="onChannelInviteClick(invite)" class="channel-invite shadow-1 rounded-borders">
        <!-- Left icon/avatar -->
        <q-item-section avatar top>
          <q-avatar color="amber-6" text-color="white" size="42px">
            <q-icon name="person_add" size="22px" />
          </q-avatar>
        </q-item-section>

        <!-- Main content -->
        <q-item-section>
          <div style="display: flex; flex-direction: row;">
            <q-icon name="priority_high" color="red" size="16px" class="blink-icon" />
            <q-item-label lines="1" class="text-weight-medium text-dark">
              {{ 'Invited to ' + invite.name }}
            </q-item-label>
          </div>

          <q-item-label caption class="text-grey-8">
            {{ 'Invitation pending since ' + invite.invitedAt.toDateString() }}
          </q-item-label>
        </q-item-section>

        <!-- Right-side indicator -->
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-item v-for="(channel, index) in channels" :key="'channel-' + index" clickable v-ripple
        @click="onChannelClick(channel)">
        <q-item-section avatar top>
          <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" />
        </q-item-section>

        <q-item-section>
          <div style="display: flex; flex-direction: row;">
            <q-icon v-if="channel.hasUnreadMsgs" name="priority_high" color="red" size="16px" class="blink-icon" />
            <q-item-label lines="1" class="text-weight-medium">{{ channel.name }}</q-item-label>
          </div>

          <q-item-label lines="1" caption>
            <template v-if="mode === 'all'">
              {{ channel.ownerId != getCurrentUser?.id ? 'Joined' : 'Created' }}
              {{
                channel.ownerId != getCurrentUser?.id
                  ? channel.joinedAt.toDateString()
                  : channel.createdAt.toDateString()
              }}
            </template>
            <template v-else>
              {{ mode === 'owned' ? 'Created' : 'Joined' }}
              {{
                channel.ownerId != getCurrentUser?.id
                  ? channel.joinedAt.toDateString()
                  : channel.createdAt.toDateString()
              }}
            </template>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
            <ChannelDropdown :items="getMenuOptions(channel)" :channels="channels" :channel="channel"
              @show-members="onShowMembers" />
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script setup lang="ts">
import type { Channel, ChannelInvite } from 'src/utils/types'
import ChannelDropdown from './ChannelDropdown.vue'
import { useAuthStore } from 'src/stores/auth-store'
import { useChannelStore } from 'src/stores/channelStore'
import { storeToRefs } from 'pinia'
import { toRef, ref, computed } from 'vue'
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
const isPublic = ref(true)

const headerTitle = computed(() => {
  if (props.mode === 'owned') return 'Owned channels'
  if (props.mode === 'joined') return 'Joined channels'
  return 'All channels'
})

// ---------- Methods ----------
function onAddClick(): void {
  showAddDialog.value = true
}

function confirmAdd(): void {
  if (!newChannelName.value.trim()) return
  if (!getCurrentUser.value) return


  if (props.mode === 'owned') {
    channelStore.createChannelAction(newChannelName.value.trim(), isPublic.value)
  } else if (props.mode === 'joined') {
    channelStore.joinChannelAction(newChannelName.value.trim())
  } else {
    return
  }

  newChannelName.value = ''
  isPublic.value = true
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

<style>
.body--dark .section-title {
  color: rgba(255, 255, 255, 0.92) !important;
}

.channel-invite {
  background-color: rgb(255, 249, 181);
}

.body--dark .channel-invite {
  background-color: rgb(41, 40, 29);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .channel-invite .text-dark {
  color: #f5f5f5 !important;
}

.body--dark .channel-invite .text-grey-8 {
  color: #b0b0b0 !important;
}
</style>
