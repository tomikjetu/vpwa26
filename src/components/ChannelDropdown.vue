<template>
  <q-menu anchor="bottom right" self="top right">
    <q-list style="min-width: 120px">
      <q-item
        v-for="(option, oIndex) in props.items"
        :key="'menu-' + oIndex"
        clickable
        v-close-popup
        :class="option.class"
        :disable="option.disable"
        @click="onSelect(option)"
      >
        <q-item-section>
          {{ option.label }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import type { DropdownItem } from 'src/utils/types.ts'

const props = defineProps<{
  items: DropdownItem[]
}>()

const emit = defineEmits<{
  (e: 'select', option: DropdownItem): void
}>()

function onSelect(option: DropdownItem) {
  emit('select', option)
}
</script>

<style>
.warning {
  color: red;
}
</style>