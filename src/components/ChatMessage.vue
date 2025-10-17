<template>
  <div class="message-card q-mb-sm">
    <!-- Header -->
    <div class="row justify-between items-start message-header">
      <!-- Left side: icon + name -->
      <div class="row items-center clickable-name" @click="$emit('show-member-info', payload.user)">
        <q-avatar color="primary" text-color="white" size="32px" class="q-mr-sm">
          <q-icon name="person" />
        </q-avatar>

        <!-- 🔹 Clickable name -->
        <div
          class="text-bold"
        >
          {{ payload.userNickname }}
        </div>
      </div>

      <!-- Right side: date -->
      <div class="text-caption text-grey-7">
        {{ payload.time }}
      </div>
    </div>

    <!-- Message text -->
    <div class="q-mt-xs text-body2 message-body">
      {{ payload.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessagePayload } from 'src/utils/types'

defineProps<{
  payload: ChatMessagePayload
}>()
</script>

<style scoped>
.message-card {
  width: 100%;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-header {
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 0.4rem;
}

.message-body {
  padding: 0.8rem;
  padding-bottom: 0.8rem;
}

.clickable-name {
  cursor: pointer;
  color: var(--q-color-primary);
  transition: color 0.2s ease;
}

.clickable-name:hover {
  color: var(--q-color-primary-light);
  text-decoration: underline;
}
</style>