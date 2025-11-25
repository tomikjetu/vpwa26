<template>
  <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember"
    :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null" />
  <ChannelInviteAccept v-model="dialog.showChannelInviteAcceptation" />

  <q-layout view="hHh lpR FfF" class="channels-layout">
    <!-- Header with burger menu (only visible on mobile) -->
    <q-header elevated class="bg-primary text-white mobile-only-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Channels</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Drawer for channels sidebar -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="280" :breakpoint="1024" bordered class="channels-drawer">
      <ChannelsBar class="pane-fill" @channel-selected="onChannelSelected" />
    </q-drawer>

    <!-- Main content area -->
    <q-page-container>
      <q-page class="chat-page">
        <ChatContainer class="pane-fill" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChannelsBar from 'src/components/Channels/ChannelsBar.vue'
import ChatContainer from 'src/components/Chat/ChatContainer.vue'
import { useDialogStore } from 'src/stores/dialog-store'
import MemberInfo from 'src/components/Dialog/MemberInfo.vue'
import ChannelInviteAccept from 'src/components/Dialog/ChannelInviteAccept.vue'
import { onMounted } from 'vue';
import { useChannelStore } from 'src/stores/channelStore';
import { useQuasar } from 'quasar'

const $q = useQuasar()
const channelStore = useChannelStore();
const dialog = useDialogStore()
const leftDrawerOpen = ref<boolean>(false)

const onChannelSelected = () => {
  // Close drawer on mobile when channel is selected
  if ($q.screen.lt.lg) {
    leftDrawerOpen.value = false
  }
}

onMounted(() => {
  channelStore.loadChannelsAndInvites();
});
</script>

<style scoped>
.channels-layout {
  height: 100vh;
  min-height: 0;
}

.mobile-only-header {
  display: none;
}

.chat-page {
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  overflow: hidden;
}

.pane-fill {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.channels-drawer {
  background: inherit;
}

/* Mobile styles - show header with burger menu */
@media (max-width: 1023px) {
  .mobile-only-header {
    display: block;
  }
}
</style>
