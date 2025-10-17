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
          <q-icon name='person' />
        </q-item-section>

        <q-item-section>
          <q-item-label class="member-name">
            {{ member.nickname }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Member } from 'src/utils/types.ts'
import { useDialogStore } from 'src/stores/dialog-store'

const dialog = useDialogStore()

function handleShowMemberInfo(member: Member) {
    dialog.openMemberInfo(member)
}

defineProps<{
  members: Member[]
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
  border-bottom: 1px solid var(--q-color-grey-4);
  flex-shrink: 0;
}

.back-btn {
  margin-right: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--q-color-primary);
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
}
</style>