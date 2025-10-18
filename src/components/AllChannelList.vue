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
import { getMenuOptions } from 'src/composables/useChannelList'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const props = defineProps<{
  channels: Channel[]
}>()

const channels = ref<Channel[]>(props.channels)

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