<template>
  <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember" :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null" />
  <ChannelInviteAccept v-model="dialog.showChannelInviteAcceptation" />

  <q-splitter
    v-model="splitter"
    unit="px"
    :limits="[280, 560]"
    separator-style="width: 4px"
    class="splitter-root"
  >
    <template #before>
      <div class="pane">
        <ChannelsBar class="pane-fill" />
      </div>
    </template>

    <template #after>
      <div class="pane">
        <ChatContainer class="pane-fill" />
      </div>
    </template>
  </q-splitter>
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
// const leftDrawerOpen = ref<boolean>(false)
const splitter = ref<number>(280)

// const onChannelSelected = () => {
//   // Close drawer on mobile when channel is selected
//   if ($q.screen.lt.sm) {
//     leftDrawerOpen.value = false
//   }
// }


onMounted(() => {
  channelStore.loadChannelsAndInvites();
  
  // For correct burger menu
  document.documentElement.style.setProperty('--sm-width', `${$q.screen.sizes.sm}px`)
});
</script>

<style scoped>
.splitter-root {
  min-height: 0;
  max-height: 100vh;
} 

.mobile-only-header {
  display: none;
}

.pane {
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.pane-fill {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
}

.channels-drawer {
  background: inherit;
}

/* Mobile styles - show header with burger menu */
@media (max-width: var(--sm-width)) {
  .mobile-only-header {
    display: block;
  }
}
</style>
