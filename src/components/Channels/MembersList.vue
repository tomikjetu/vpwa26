<template>
  <div class="members-list">

    <div class="members-header">
      <q-btn flat dense round icon="arrow_back" color="primary" @click="$emit('cancel')" class="back-btn" />
      <span class="header-title">Members</span>
    </div>

    <q-list class="q-pa-none">
      <q-item v-for="member in membersList" :key="'member-' + member.id" clickable class="member-item"
        @click="handleShowMemberInfo(member)">
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="member-name row items-center no-wrap">
            <!-- Colored status circle -->
            <q-icon name="circle" size="10px" class="q-mr-sm" :color="getMemberStatusColor(member)" />
            {{ member.nickname }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, toRef } from 'vue'
import type { Member, Channel, UserStatus } from 'src/utils/types'
import { useDialogStore } from 'src/stores/dialog'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { useChannelStore } from 'src/stores/channel'

const authStore = useAuthStore()
const channelStore = useChannelStore()
const { getCurrentUser } = storeToRefs(authStore)

const dialog = useDialogStore()

const props = defineProps<{
  channel: Channel | undefined
}>()

const channel = toRef(props, 'channel')

/** 
 * Computed list of members that reacts to status changes.
 * This reads from the channel store directly to ensure reactivity.
 */
const membersList = computed(() => {
  if (!channel.value) return []

  // Get the channel from the store (this ensures we get reactive updates)
  const storeChannel = channelStore.getChannelById(channel.value.id)
  if (!storeChannel) return []

  // Convert members object to array
  const rawMembers = storeChannel.members
  return Array.isArray(rawMembers) ? rawMembers : Object.values(rawMembers ?? {})
})

/** Opens the member info dialog */
function handleShowMemberInfo(member: Member) {
  if (!channel.value) return
  dialog.openMemberInfo(member, channel.value)
}

/** Returns the color based on member's status */
function getMemberStatusColor(member: Member): string {
  if (!member || !getCurrentUser.value) return 'grey'

  const status: UserStatus | undefined = member.status

  // Hide offline status for other users (show grey)
  if (status === 'offline' && member.userId !== getCurrentUser.value.id) return 'grey'

  switch (status) {
    case 'online':
      return 'green'
    case 'inactive':
      return 'yellow'
    case 'dnd':
      return 'orange'
    case 'offline':
      return 'red'
    default:
      return 'grey'
  }
}
</script>

<style scoped>
.members-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.members-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #cccccc;
  flex-shrink: 0;
}

.back-btn {
  margin-right: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: #027be3;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.member-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: flex;
  align-items: center;
}
</style>
