<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <!-- Header Section -->
      <q-card-section class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="person" size="md" class="q-mr-sm" />
          <div class="text-h6">{{ member ? member.nickname : "" }}</div>
        </div>

        <!-- Right side: owner or vote count -->
        <div class="row items-center">
          <template v-if="member && member.isOwner">
            <q-icon name="star" color="amber" class="q-mr-xs" />
            <span class="text-subtitle2 text-bold">Owner</span>
          </template>
          <template v-else>
            <span class="text-subtitle2 text-grey-8">
              Kick votes: {{ member ? member.kickVotes : 0 }} / 3
            </span>
          </template>
        </div>
      </q-card-section>

      <!-- Typing Section -->
      <q-card-section>
        <div class="text-subtitle2 text-grey-8 q-mb-xs">
          Currently being typed by user:
        </div>

        <div
          class="typing-box"
          :class="{
            'text-grey-6': member && (!member.currentlyTyping || member.currentlyTyping.trim() === '')
          }"
        >
          {{ member && member.currentlyTyping && member.currentlyTyping.trim() !== ''
            ? member.currentlyTyping
            : 'User is currently not typing' }}
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineModel } from 'vue'
import type { Member } from 'src/utils/types.ts'

const show = defineModel<boolean>('modelValue', { required: true })

defineProps<{
  member: Member | null
}>()
</script>

<style scoped>
.typing-box {
  min-height: 80px;
  border: 1px solid var(--q-color-grey-5);
  border-radius: 6px;
  padding: 8px 10px;
  background-color: #fafafa;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 15px;
}

.text-grey-6 {
  color: var(--q-color-grey-6);
}
</style>