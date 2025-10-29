<template>
  <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember" :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null" />
  <ChannelInviteAccept v-model="dialog.showChannelInviteAcceptation" />
  <ChatContainer class="pane-fill with-padding-top" />
</template>

<script setup lang="ts">
import ChatContainer from 'src/components/Chat/ChatContainer.vue'
import { useDialogStore } from 'src/stores/dialog-store'
import MemberInfo from 'src/components/Dialog/MemberInfo.vue'
import ChannelInviteAccept from 'src/components/Dialog/ChannelInviteAccept.vue'

const dialog = useDialogStore()
</script>

<style>

.splitter-root {
  height: 100vh;
  min-height: 0;
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
}

@media (max-width: 1023px) {
  .with-padding-top {
    padding-top: 60px;
  }
}

</style>
