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

const dialog = useDialogStore()
const splitter = ref<number>(280)
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

</style>
