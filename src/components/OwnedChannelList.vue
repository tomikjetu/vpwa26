<template>
    <q-item-label header class="row items-center justify-between">
      <span>Owned channels</span>

      <q-btn
        flat
        dense
        color="primary"
        icon="add"
        label="Create"
        size="sm"
        @click="onAddClick"
      />
    </q-item-label>

    <!-- Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Create Channel</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="newChannelName"
            label="Channel name"
            dense
            autofocus
          />
          <q-option-group
            v-model="isPublic"
            :options="[
              { label: 'Public', value: true },
              { label: 'Private', value: false }
            ]"
            type="radio"
            inline
            class="q-mt-md"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Create" color="primary" @click="confirmAdd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-scroll-area style="flex: 1">
        <q-list padding>
            <q-item v-for="(channel, index) in channels" :key="'search-' + index" clickable v-ripple @click="onChannelClick(channel)">
                <q-item-section avatar top>
                    <q-avatar :icon="channel.icon" :color="channel.color" text-color="white" />
                </q-item-section>

                <q-item-section>
                    <q-item-label lines="1">{{ channel.name }}</q-item-label>
                    <q-item-label lines="1" caption>
                        Created {{ channel.ownerId !=
                            getCurrentUser?.id ? channel.joinedAt.toDateString() : channel.createdAt.toDateString() }}
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
                        <ChannelDropdown
                          :items="getMenuOptions(channel)"
                          @select="handleDropdownSelect(channel, $event)"
                        />
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>
    </q-scroll-area>
</template>

<script setup lang="ts">
import type { Channel, DropdownItem } from 'src/utils/types.js'
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

function addChannel(newChannel: Channel): void {
  channels.value.push(newChannel)
  
  channelStore.addChannel(newChannel)
}

function removeChannel(channelId: number): void {
  channelStore.removeChannel(channelId)

  channels.value = channels.value.filter(channel => channel.id !== channelId)
}
/** Handles a dropdown option selection */
function handleDropdownSelect(channel: Channel, option: DropdownItem) {
  const label = option.label.toLowerCase()
  if (label.includes('remove')) {
    removeChannel(channel.id)
  }
}
// State for dialog and form
const showAddDialog = ref(false)
const newChannelName = ref('')
const isPublic = ref(true)

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
    isPublic: isPublic.value,
    createdAt: currDate,
    ownerId: getCurrentUser.value?.id,
    icon: isPublic.value ? 'group' : 'lock',
    color: 'primary', // default color
    updatedAt: currDate,
    joinedAt: currDate,
    infoColor: 'grey',
  }

  addChannel(newChannel)

  // Reset and close
  newChannelName.value = ''
  isPublic.value = true
  showAddDialog.value = false
}

const emit = defineEmits<{
  (e: 'select-channel', channel: Channel): void
}>()

function onChannelClick(channel: Channel) {
  emit('select-channel', channel)
}
</script>