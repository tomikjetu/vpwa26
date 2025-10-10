<template>
    <q-menu anchor="bottom right" self="top right">
        <q-list style="min-width: 120px">
            <q-item
                v-for="(option, oIndex) in items"
                :key="'menu-' + oIndex"
                clickable
                v-close-popup
                :class="option.class"
                :disable="option.disable"
            >
                <q-item-section>
                    {{ option.label }}
                </q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script setup lang="ts">
import type { DropdownItem } from './models.ts'

defineProps<{
  items: DropdownItem[]
}>()
</script>

<style>
.warning {
  color: red
}
</style>