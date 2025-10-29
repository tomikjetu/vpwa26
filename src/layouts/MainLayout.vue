<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <ChannelsBar />
    </q-drawer>

    <q-page-container>
      <q-page-sticky position="top-left" :offset="[18, 18]">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="lt-md"
        />
      </q-page-sticky>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChannelsBar from 'src/components/Channels/ChannelsBar.vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style>
.menu-settings {
  min-width: 300px;
  max-width: none !important;
  white-space: nowrap;
}

.menu-settings .q-btn {
  min-width: 160px;
}
</style>
