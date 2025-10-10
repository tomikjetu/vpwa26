<template>
  <div class="message-card q-mb-sm">
    <!-- Header -->
    <div class="row justify-between items-start message-header">
      <!-- Left side: icon + name -->
      <div class="row items-center">
        <q-avatar color="primary" text-color="white" size="32px" class="q-mr-sm">
          <q-icon name="person" />
        </q-avatar>

        <div class="text-bold">{{ name }}</div>
      </div>

      <!-- Right side: date -->
      <div class="text-caption text-grey-7">
        {{ date }}
      </div>
    </div>

    <!-- Message text -->
    <div class="q-mt-xs text-body2 message-body">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  date: string
  text: string
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
</style>