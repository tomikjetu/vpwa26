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
              :color="getStatusColor(member.id)"
            />
            {{ member.nickname }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Member, Channel } from 'src/utils/types'
import { useDialogStore } from 'src/stores/dialog-store'
import { useContacts } from 'src/stores/contacts-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const dialog = useDialogStore()
const contactsStore = useContacts()

/** Opens the member info dialog */
function handleShowMemberInfo(member: Member) {
  if(!props.channel) return
  dialog.openMemberInfo(member, props.channel)
}

/** Returns the color based on contact status */
function getStatusColor(memberId: number): string {
  const contact = contactsStore.contacts[memberId]
  if (!getCurrentUser.value) return 'grey'
  const currentUserStatus = contactsStore.contacts[getCurrentUser.value.id]?.status
  if (!contact || (currentUserStatus == 'offline' && contact?.id != getCurrentUser.value.id)) return 'grey'

  switch (contact.status) {
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
  members: Member[],
  channel: Channel | undefined
}>()
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
