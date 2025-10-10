<template>
  <q-page style="border-right: 1px solid black; height: 100vh; display: flex; flex-direction: column;">

    <!-- 🟢 Search Input -->
    <q-input square filled v-model="search" label="Search" type="text" clearable debounce="300"
      class="flat-top q-mt-md q-mb-md" style="width: 350px; flex: 0 0 auto">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- 🟣 Main container for lists -->
    <div style="width: 350px; flex: 1 1 auto; display: flex; flex-direction: column;">
      <template v-if="search.trim() !== ''">
        <!-- When searching: merged filtered list -->
        <q-item-label header>
          All channels
        </q-item-label>
        <q-scroll-area class="scroll" style="flex: 1;">
          <q-list bordered padding style="flex: 1">
            <q-item v-for="(item, index) in filteredAll" :key="'search-' + index" clickable v-ripple>
              <q-item-section avatar top>
                <q-avatar :icon="item.icon" :color="item.color" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">{{ item.name }}</q-item-label>
                <q-item-label lines="1" caption>
                  {{ item.isFolder ? 'Joined' : 'Created' }} {{ item.joinedAt.toLocaleDateString() }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </template>

      <template v-else>
        <!-- 🟢 Channels (top 2/3) -->
        <q-item-label header>
          Channels
        </q-item-label>
        <q-scroll-area class="scroll" style="flex: 2;">
          <q-list bordered padding class="scroll" style="flex: 2;">


            <q-item v-for="(folder, index) in channelStore.channels" :key="'folder-' + index" clickable v-ripple>
              <q-item-section avatar top>
                <q-avatar :icon="folder.icon" :color="folder.color" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">{{ folder.name }}</q-item-label>
                <q-item-label lines="1" caption>Joined {{ folder.joinedAt.toLocaleDateString() }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
                  <!-- The dropdown itself -->
                  <q-menu anchor="bottom right" self="top right">
                    <q-list style="min-width: 120px">
                      <q-item clickable v-close-popup>
                        <q-item-section>Invite</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section>Members</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section>Change icon</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <!-- 🟠 My Channels (bottom 1/3) -->
        <q-item-label header>My channels</q-item-label>
        <q-scroll-area class="scroll" style="flex: 1;">
          <q-list bordered padding class="scroll" style="flex: 1;">
            <q-item v-for="(file, index) in channelStore.getOwnedChannels" :key="'file-' + index" clickable v-ripple>
              <q-item-section avatar top>
                <q-avatar :icon="file.icon" :color="file.color" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">{{ file.name }}</q-item-label>
                <q-item-label lines="1" caption>Created {{ file.createdAt.toLocaleDateString() }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <!-- Button that triggers dropdown -->
                <q-btn round dense icon="more_horiz" @click.stop @mousedown.stop>
                  <!-- The dropdown itself -->
                  <q-menu anchor="bottom right" self="top right">
                    <q-list style="min-width: 120px">
                      <q-item clickable v-close-popup>
                        <q-item-section>Invite</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section>Members</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section>Change icon</q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup>
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannelStore } from 'src/stores/channelStore'

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
  overflow-y: auto;
  /* enable vertical scrolling */
}
</style>