<template>
  <div class="info-bar row items-center q-pa-md">
    <!-- Mobile burger menu -->
    <q-btn flat dense round icon="menu" class="burger-btn q-mr-sm" @click="$emit('toggle-drawer')" />

    <!-- Channel info -->
    <div class="column q-mr-auto">
      <div class="row items-center q-gutter-sm">
        <span class="text-weight-bold text-h6 text-color-primary">
          {{ props.channel ? props.channel.name : '' }}
        </span>
        <q-badge :color="props.channel?.isPrivate ? 'orange' : 'positive'" rounded class="q-px-sm">
          <q-icon :name="props.channel?.isPrivate ? 'lock' : 'public'" size="12px" class="q-mr-xs" />
          {{ props.channel ? props.channel.isPrivate ? 'Private' : 'Public' : '' }}
        </q-badge>
      </div>
      <div class="text-caption text-color-muted">
        Created {{ props.channel ? formatDate(props.channel.createdAt) : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Channel } from 'src/utils/types'

const props = defineProps<{
  channel: Channel | null
}>()

defineEmits<{
  (e: 'toggle-drawer'): void
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.info-bar {
  width: 100%;
  background: var(--bg-surface);
  flex: 0 0 auto;
  border-bottom: 1px solid var(--border-light);
  border-radius: 16px 16px 0 0;
}

/* Hide burger on desktop */
.burger-btn {
  display: none;
}

@media (max-width: 1023px) {
  .burger-btn {
    display: flex;
  }

  .info-bar {
    border-radius: 0;
  }
}
</style>
