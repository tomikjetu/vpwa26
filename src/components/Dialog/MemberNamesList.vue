<template>
  <!-- Dialog with List -->
  <q-dialog v-model="show">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">List of Members</div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-list>
          <!-- Loop over the list of strings -->
          <q-item v-for="(item, index) in props.members" :key="index">
            <q-item-section>
              {{ item.nickname }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions>
        <q-btn label="Close" color="primary" @click="dialogStore.closeMemberList()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Member } from 'src/utils/types';
import { useDialogStore } from 'src/stores/dialog-store';

const dialogStore = useDialogStore()
const show = defineModel<boolean>('modelValue', { required: true })

const props = defineProps<{
  members: Member[] | null
}>()

</script>

<style scoped>
/* Optional: style the dialog if needed */
</style>