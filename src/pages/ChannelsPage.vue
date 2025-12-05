<template>
  <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember"
    :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null" />
  <ChannelInviteAccept v-model="dialog.showChannelInviteAcceptation" />
  <MemberNamesList v-model="dialog.showMemberListDialog" :members="dialog.memberList" />

  <q-layout view="hHh lpR FfF" class="channels-layout">
    <!-- Drawer for channels sidebar -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="320" :breakpoint="1024" bordered class="channels-drawer">
      <ChannelsBar class="pane-fill" @channel-selected="onChannelSelected"
        @toggle-drawer="leftDrawerOpen = !leftDrawerOpen" />
    </q-drawer>

    <!-- Main content area -->
    <q-page-container>
      <q-page class="chat-page">
        <ChatContainer class="pane-fill" @toggle-drawer="leftDrawerOpen = !leftDrawerOpen" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import ChannelsBar from 'src/components/Channels/ChannelsBar.vue'
import ChatContainer from 'src/components/Chat/ChatContainer.vue'
import { useDialogStore } from 'src/stores/dialog'
import MemberInfo from 'src/components/Dialog/MemberInfo.vue'
import ChannelInviteAccept from 'src/components/Dialog/ChannelInviteAccept.vue'
import { onMounted } from 'vue';
import { useChannelStore } from 'src/stores/channel';
import { useQuasar } from 'quasar'
import MemberNamesList from 'src/components/Dialog/MemberNamesList.vue'

const $q = useQuasar()
const channelStore = useChannelStore();
const dialog = useDialogStore()
const leftDrawerOpen = ref<boolean>(false)

const onChannelSelected = () => {
  // Close drawer on mobile when channel is selected
  if ($q.screen.lt.sm) {
    leftDrawerOpen.value = false
  }
}


onMounted(() => {
  channelStore.loadChannelsAndInvites();

  // For correct burger menu
  document.documentElement.style.setProperty('--sm-width', `${$q.screen.sizes.sm}px`)
});
</script>

<style scoped>
.channels-layout {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

:deep(.q-page-container) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-page {
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  overflow: hidden;
  padding: 0 !important;
}

.pane-fill {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
}

.channels-drawer {
  background: var(--sidebar-bg) !important;
  border-right: 1px solid var(--sidebar-border) !important;
}

:deep(.channels-drawer .q-drawer__content) {
  background: var(--sidebar-bg);
}
</style>
