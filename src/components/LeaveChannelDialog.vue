<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">
          {{ props.isOwner ? 'Remove Channel' : 'Leave Channel' }}
        </div>
      </q-card-section>

      <q-card-section>
        <p class="q-mb-none">
          {{ props.isOwner
            ? 'Are you sure you want to remove this channel permanently?'
            : 'Are you sure you want to leave this channel?' }}
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="secondary" v-close-popup />
        <q-btn
          flat
          :label="isOwner ? 'Remove' : 'Leave'"
          :color="isOwner ? 'negative' : 'primary'"
          @click="confirmLeave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineModel } from 'vue'

const show = defineModel<boolean>('modelValue', { required: true })

const props = defineProps<{
  isOwner: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

function confirmLeave() {
  emit('confirm')
  show.value = false
}
</script>

<style scoped>
p {
  font-size: 15px;
  line-height: 1.4;
}
</style>