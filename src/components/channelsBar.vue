<template>
  <q-page class="channels-bar-container">

      <!-- 🟢 Search Input -->
      <q-input
        square
        filled
        v-model="search"
        label="Search"
        type="text"
        clearable
        debounce="300"
        class="flat-top q-mt-md q-mb-md channels-search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- 🟣 Main container for lists -->
      <div class="channels-list-container">
        <template v-if="search.trim() !== ''">
          <ChannelList title="All channels" :channels="filteredAll" :flex="1"></ChannelList>
        </template>

        <template v-else>
          <ChannelList title="Channels" :channels="channelStore.channels" :flex="2"></ChannelList>
          <ChannelList title="Owned channels" :channels="channelStore.getOwnedChannels" :flex="1"></ChannelList>
        </template>
      </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannelStore } from 'src/stores/channelStore'
import ChannelList from './ChannelList.vue'

const search = ref('')
const channelStore = useChannelStore()

// Merge and filter lists when searching
const filteredAll = computed(() => {
  const allItems = [...channelStore.channels, ...channelStore.getOwnedChannels]
  return allItems.filter((item) =>
    item.name.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>



<style scoped>
.scroll {
  overflow-y: auto;    /* enable vertical scrolling */
}

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

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 1;
}
</style>