<template>
  <q-dialog v-model="show" persistent>
    <q-card class="q-pa-md q-pt-lg q-pb-lg channel-invite-dialog bg-surface text-app border-left-app">
      <!-- Channel icon and name -->
      <div class="column items-center q-mb-md">
        <q-avatar :color="dialogStore.channelInvite?.color" text-color="white" size="70px" class="q-mb-sm">
          <q-icon :name="dialogStore.channelInvite?.icon || 'group_add'" size="32px" />
        </q-avatar>

        <div class="text-h6 text-weight-medium text-center">
          Join channel <span class="text-primary">{{ dialogStore.channelInvite?.name }}</span>?
        </div>

        <q-item-label caption class="text-grey-7 q-mt-xs">
          Invited {{ dialogStore.channelInvite?.invitedAt.toDateString() }}
        </q-item-label>
      </div>

      <!-- Action buttons -->
      <div class="row justify-evenly q-mt-md">
        <q-btn flat class="text-primary" label="Accept" icon="check" @click="onAcceptInvite()" />
        <q-btn color="negative" label="Decline" icon="close" flat @click="onDeclineInvite()" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';
import { useDialogStore } from 'src/stores/dialog'
import { useChannelStore } from 'src/stores/channel'

const dialogStore = useDialogStore()
const channelStore = useChannelStore()

const show = defineModel<boolean>('modelValue', { required: true })

function onAcceptInvite() {
  if (!dialogStore.channelInvite) return
  channelStore.acceptChannelInviteAction(dialogStore.channelInvite.channelId)
  dialogStore.closeChannelInviteAcceptation()
}

function onDeclineInvite() {
  if (!dialogStore.channelInvite) return
  channelStore.declineChannelInviteAction(dialogStore.channelInvite.channelId)
  dialogStore.closeChannelInviteAcceptation()
}
</script>

<style scoped>
.channel-invite-dialog {
  min-width: 320px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
</style>
