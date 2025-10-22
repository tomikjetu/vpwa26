<template>
  <q-layout view="lHh Lpr lFf">
    <CommandLine />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import CommandLine from 'src/components/CommandLine/CommandLine.vue'
</script>

<style>
.menu-settings {
  min-width: 300px;
  max-width: none !important;
  white-space: nowrap;
}

.menu-settings .q-btn {
  min-width: 160px;
}
</style>
