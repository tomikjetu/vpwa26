<template>
    <q-item-label header class="row items-center justify-between">
      <span>Joined channels</span>

      <q-btn
        flat
        dense
        color="primary"
        icon="add"
        label="Join"
        size="sm"
        @click="onAddClick"
      />
    </q-item-label>

  <!-- Dialog -->
  <q-dialog v-model="showAddDialog">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Join Channel</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="newChannelName"
          label="Enter channel name to join"
          dense
          autofocus
        />
        <div class="text-caption text-grey q-mt-sm">
          Type the name of the channel you want to join.  
          If it’s public, you’ll be added automatically.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Join" color="primary" @click="confirmAdd" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-scroll-area style="flex: 2">
    <q-list padding>
      <q-item
        v-for="(channel, index) in channels"
        :key="'search-' + index"
        clickable
        v-ripple
        @click="onChannelClick(channel)"
      >
        <q-item-section avatar top>
          <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" />
        </q-item-section>

        <q-item-section>
          <div style="display: flex; flex-direction: row;">
            <q-icon
              v-if="channel.hasUnreadMsgs"
              name="priority_high"
              color="red"
              size="16px"
              class="blink-icon"
            />
            <q-item-label lines="1">{{ channel.name }}</q-item-label>
          </div>
          <q-item-label lines="1" caption>
            Joined {{
              channel.ownerId != getCurrentUser?.id
                ? channel.joinedAt.toDateString()
                : channel.createdAt.toDateString()
            }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
            <ChannelDropdown
              :items="getMenuOptions(channel)"
              :channels="channels"
              :channel="channel"
              @show-members="onShowMembers"
            />
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>
<script setup lang="ts">
import type { Channel } from 'src/utils/types.ts'
import ChannelDropdown from './ChannelDropdown.vue'
import { useAuthStore } from 'src/stores/auth-store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { getMenuOptions, addChannel } from 'src/composables/useChannelList'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const props = defineProps<{
    channels: Channel[]
}>()

const channels = ref<Channel[]>(props.channels)

// State for dialog and form
const showAddDialog = ref(false)
const newChannelName = ref('')

function onAddClick(): void {
  showAddDialog.value = true
}

function confirmAdd(): void {
  if (!newChannelName.value.trim()) return
  if (!getCurrentUser.value) return

  const currDate = new Date()
  const newChannel: Channel = {
    id: Math.floor(Math.random() * 1_000_000_000),
    name: newChannelName.value.trim(),
    isPublic: true,
    createdAt: currDate,
    ownerId: getCurrentUser.value?.id + 1,
    icon: 'group', // default icon
    color: 'primary', // default color
    updatedAt: currDate,
    joinedAt: currDate,
    infoColor: 'grey',
    hasUnreadMsgs: false,
    members: {
      [getCurrentUser.value.id]: {
        id: getCurrentUser.value.id,
        nickname: getCurrentUser.value.nickName,
        kickVotes: 0,
        isOwner: true,
        kickVoters: []
      }
    }
  }

  addChannel(newChannel, channels.value)

  // Reset and close
  newChannelName.value = ''
  showAddDialog.value = false
}

const emit = defineEmits<{
  (e: 'select-channel', channel: Channel): void
  (e: 'show-members', channel: Channel): void
}>()

function onChannelClick(channel: Channel) {
  emit('select-channel', channel)
}

function onShowMembers(channel: Channel) {
  emit('show-members', channel)
}
</script>