<template>
  <!-- Dialog with List -->
  <q-dialog v-model="show">
    <q-card class="dialog-card rounded-lg">
      <q-card-section>
        <div class="text-h6 text-color-primary">List of Members</div>
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <q-list>
          <!-- Loop over the list of strings -->
          <q-item v-for="(item, index) in props.members" :key="index" class="rounded-md member-item">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="32px" class="rounded-lg">
                <q-icon name="person" size="18px" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <span class="text-color-primary">{{ item.nickname }}</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="dialogStore.closeMemberList()" class="rounded-md" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Member } from 'src/utils/types';
import { useDialogStore } from 'src/stores/dialog';

const dialogStore = useDialogStore()
const show = defineModel<boolean>('modelValue', { required: true })

const props = defineProps<{
  members: Member[] | null
}>()

</script>

<style scoped>
.dialog-card {
  min-width: 350px;
  background: var(--bg-surface);
}

.member-item {
  margin: 2px 0;
}
</style>