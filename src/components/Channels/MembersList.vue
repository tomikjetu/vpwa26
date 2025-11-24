<template>
  <div class="members-list">

    <div class="members-header">
      <q-btn
        flat
        dense
        round
        icon="arrow_back"
        color="primary"
        @click="$emit('cancel')"
        class="back-btn"
      />
      <span class="header-title">Members</span>
    </div>

    <q-list class="q-pa-none">
      <q-item
        v-for="(member, index) in members"
        :key="'member-' + index"
        clickable
        class="member-item"
        @click="handleShowMemberInfo(member)"
      >
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="member-name row items-center no-wrap">
            <!-- Colored status circle -->
            <q-icon
              name="circle"
              size="10px"
              class="q-mr-sm"
              :color="getStatusColor(member.userId)"
            />
            {{ member.nickname }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, toRef } from 'vue'
import type { Member, Channel } from 'src/utils/types'
import { useDialogStore } from 'src/stores/dialog-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'
import { useChannelStore } from 'src/stores/channelStore'
import { useChatStore } from 'src/stores/chat-store'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const dialog = useDialogStore()

/** Opens the member info dialog */
function handleShowMemberInfo(member: Member) {
  if(!channel.value) return
  dialog.openMemberInfo(member, channel.value)
}

/** Returns the color based on contact status */
function getStatusColor(memberId: number): string {
  const channelStore = useChannelStore()
  const chatStore = useChatStore()

  if(!chatStore.channel) return 'grey'
  
  const member = channelStore.getMemberById(memberId, chatStore.channel.id)

  if(!member) return 'grey'
  if (!getCurrentUser.value) return 'grey'
  const currentMemberStatus = member.status
  if (!member || (currentMemberStatus == 'offline' && member?.id != getCurrentUser.value.id)) return 'grey'

  switch (member.status) {
    case 'online':
      return 'green'
    case 'dnd':
      return 'orange'
    case 'offline':
      return 'red'
    default:
      return 'grey'
  }
}

const props = defineProps<{
  channel: Channel | undefined
}>()

const channel = toRef(props, 'channel')
const members = computed(() => channel.value?.members ?? [])
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
