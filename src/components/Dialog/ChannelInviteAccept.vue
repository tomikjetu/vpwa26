<template>
  <q-dialog v-model="show" persistent>
    <q-card class="channel-invite-dialog rounded-xl">
      <!-- Channel icon and name -->
      <div class="column items-center q-mb-md">
        <q-avatar :color="dialogStore.channelInvite?.color" text-color="white" size="72px" class="q-mb-md rounded-xl">
          <q-icon :name="dialogStore.channelInvite?.icon || 'group_add'" size="32px" />
        </q-avatar>

        <div class="text-h6 text-weight-medium text-center text-color-primary">
          Join channel <span class="text-primary">{{ dialogStore.channelInvite?.name }}</span>?
        </div>

        <q-item-label caption class="q-mt-xs text-color-muted">
          Invited {{ dialogStore.channelInvite?.invitedAt.toDateString() }}
        </q-item-label>
      </div>

      <!-- Action buttons -->
      <div class="row justify-evenly q-mt-lg q-gutter-sm">
        <q-btn outline class="rounded-lg" color="primary" label="Accept" icon="check" @click="onAcceptInvite()" />
        <q-btn flat class="rounded-lg" color="negative" label="Decline" icon="close" @click="onDeclineInvite()" />
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
  min-width: 340px;
  padding: 28px 24px;
  background: var(--bg-surface);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
</style>
