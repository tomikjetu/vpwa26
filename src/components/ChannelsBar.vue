<template>
  <q-page class="channels-bar-container">

    <!-- 🟢 Search Input -->
    <q-input square filled v-model="search" label="Search" type="text" clearable debounce="300"
      class="flat-top q-mt-md q-mb-md channels-search-input">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- 🟣 Main container for lists -->
    <div class="channels-list-container">
      <template v-if="search.trim() !== ''">
        <AllChannelList
          :channels="filteredAll"
          @select-channel="handleSelectChannel" />
      </template>

      <template v-else>
        <JoinedChannelList :channels="channelStore.getJoinedChannels" @select-channel="handleSelectChannel" ></JoinedChannelList>
        <OwnedChannelList :channels="channelStore.getOwnedChannels" @select-channel="handleSelectChannel" ></OwnedChannelList>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannelStore } from 'src/stores/channelStore'
import AllChannelList from './AllChannelList.vue'
import JoinedChannelList from './JoinedChannelList.vue'
import OwnedChannelList from './OwnedChannelList.vue'
import type { Channel } from 'src/utils/types.ts'

const search = ref('')
const channelStore = useChannelStore()

// Merge and filter lists when searching 
const filteredAll = computed(() => {
  return channelStore.channels
})

const emit = defineEmits<{
  (e: 'channel-selected', channel: Channel): void
}>()

function handleSelectChannel(channel: Channel) {
  emit('channel-selected', channel) // 🔁 Re-emit upward
}
</script>



<style scoped>
.channels-bar-container {
  border-right: 1px solid rgb(195, 195, 195);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.channels-search-input {
  width: 350px;
  flex: 0 0 auto;
}

.channels-list-container {
  width: 350px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
</style>
