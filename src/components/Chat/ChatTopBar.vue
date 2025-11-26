<template>
  <div class="info-bar row items-start justify-between q-pa-sm">
    <!-- Left side (Name + Created) -->
    <div class="column">
      <div class="text-bold q-ma-sm text-h5">{{ props.channel ? props.channel.name : '' }}</div>
      <div class="text-caption text-grey-7 q-ml-sm">
        {{ props.channel ? props.channel.createdAt.toDateString() : '' }}
      </div>
    </div>

    <!-- Right side (Private) -->
    <div class="text-caption text-grey-8 q-mr-lg">{{ props.channel ? props.channel.isPrivate ? 'Private' : 'Public' : ''
      }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Channel } from 'src/utils/types'

const props = defineProps<{
  channel: Channel | null
}>()

</script>

<style scoped>
.info-bar {
  width: 100%;
  border-bottom: 1px solid #ddd;
  background: #fff;
  flex: 0 0 auto;
}

.body--dark .info-bar {
  border-color: #444;
  background: #2c2c2c;
}
</style>
