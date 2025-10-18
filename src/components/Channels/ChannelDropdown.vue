<template>

  <!-- 🟣 Dialog -->
  <q-dialog v-model="showInviteDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Invite to Channel</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="personName"
          label="Enter person's name"
          filled
          autofocus
          clearable
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="secondary" v-close-popup />
        <q-btn flat label="Invite" color="primary" @click="invitePerson" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-menu anchor="bottom right" self="top right">
    <q-list style="min-width: 120px">
      <q-item
        v-for="(option, oIndex) in props.items"
        :key="'menu-' + oIndex"
        clickable
        v-close-popup
        :class="option.class"
        :disable="option.disable"
        @click="onDropdownSelect(option)"
      >
        <q-item-section>
          {{ option.label }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import type { DropdownItem, Channel } from 'src/utils/types.ts'
import { handleDropdownSelect } from 'src/composables/useChannelList';
import { ref } from 'vue'

const props = defineProps<{
  items: DropdownItem[],
  channels: Channel[],
  channel: Channel
}>()

const emit = defineEmits<{
  (e: 'show-members', channel: Channel): void
}>()

const showInviteDialog = ref(false)
const personName = ref('')

function invitePerson() {
  if (!personName.value.trim()) return
  
  console.log(`Inviting ${personName.value} to the channel ${props.channel.name}`)

  showInviteDialog.value = false
  personName.value = ''
}

async function onDropdownSelect(option: DropdownItem) {
  await handleDropdownSelect(emit, showInviteDialog, props.channel, props.channels, option)
}
</script>

<style>
.warning {
  color: red;
}
</style>