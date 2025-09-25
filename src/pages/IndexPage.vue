<template>
  <q-page class="row items-center justify-evenly bg-gray-100 min-h-screen">
    <div class="p-8 bg-white rounded-2xl shadow-xl text-center">
      <h1 class="text-3xl font-bold text-amber-300 mb-4">
        Tailwind Test Page
      </h1>
      <p class="text-gray-700 mb-6">
        This is a sample page to demonstrate Tailwind CSS integration with Quasar Framework.
      </p>

      <example-component
        title="Example component"
        active
        :todos="todos"
        :meta="meta"
        class="border-2 border-dashed border-blue-400 p-4 rounded-lg"
      ></example-component>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';

const todos = ref<Todo[]>([
  { id: 1, content: 'ct1' },
  { id: 2, content: 'ct2' },
  { id: 3, content: 'ct3' },
  { id: 4, content: 'ct4' },
  { id: 5, content: 'ct5' },
  { id: 6, content: 'ct6' },
]);

const meta = ref<Meta>({
  totalCount: 1200,
});
</script>
