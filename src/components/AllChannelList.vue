<template>
  <q-item-label header>
    <span>All channels</span>
  </q-item-label>

  <q-scroll-area style="flex: 1">
    <q-list padding>
      <q-item
        v-for="(channel, index) in channels"
        :key="'search-' + index"
        clickable
        v-ripple
        @click="onChannelClick(channel)"
        >
            <q-item-section avatar top>
                <q-avatar
                :icon="channel.icon"
                :color="channel.color"
                text-color="white"
                />
            </q-item-section>

            <q-item-section>
                <q-item-label lines="1">{{ channel.name }}</q-item-label>
                <q-item-label lines="1" caption>
                {{ channel.ownerId != getCurrentUser?.id ? 'Joined' : 'Created' }}
                {{
                    channel.ownerId != getCurrentUser?.id
                    ? channel.joinedAt.toDateString()
                    : channel.createdAt.toDateString()
                }}
                </q-item-label>
            </q-item-section>

            <q-item-section side>
                <q-btn
                round
                dense
                icon="more_horiz"
                @click.stop
                @mousedown.stop
                >
                <ChannelDropdown
                    :items="getMenuOptions(channel)"
                    @select="handleDropdownSelect(channel, $event)" />
                </q-btn>
            </q-item-section>
        </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script setup lang="ts">
import type { Channel, DropdownItem } from 'src/utils/types.ts'
import ChannelDropdown from './ChannelDropdown.vue'
import { useAuthStore } from 'src/stores/auth-store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useChannelStore } from 'src/stores/channelStore'

const channelStore = useChannelStore()
const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const getMenuOptions = (channel: Channel): DropdownItem[] => {
  return [
    { label: 'Invite', class: '', disable: channel.ownerId != getCurrentUser.value?.id && !channel.isPublic },
    { label: 'Members', class: '', disable: false },
    { label: 'Change icon', class: '', disable: false },
    { label: channel.ownerId != getCurrentUser.value?.id ? 'Leave' : 'Remove', class: 'warning', disable: false }
  ]
}

const props = defineProps<{
  channels: Channel[]
}>()

const channels = ref<Channel[]>(props.channels)

/** Removes a channel by its numeric ID */
function removeChannel(channelId: number): void {
  // 1️⃣ Remove it from the store (main data source)
  channelStore.removeChannel(channelId)

  // 2️⃣ Also update the local copy if needed
  channels.value = channels.value.filter(channel => channel.id !== channelId)
}
/** Handles a dropdown option selection */
function handleDropdownSelect(channel: Channel, option: DropdownItem) {
  const label = option.label.toLowerCase()
  if (label.includes('remove') || label.includes('delete')) {
    removeChannel(channel.id)
  }
}

const emit = defineEmits<{
  (e: 'select-channel', channel: Channel): void
}>()

function onChannelClick(channel: Channel) {
  emit('select-channel', channel)
}
</script>