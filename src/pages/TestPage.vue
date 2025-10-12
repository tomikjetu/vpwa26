<template>
  <q-page class="flex flex-center column q-pa-lg">
    <ChannelsBar/>

    <div class="q-pa-md q-gutter-sm">

        <q-bar>
        <div class="cursor-pointer">File</div>
        <div class="cursor-pointer">Edit</div>
        <div class="cursor-pointer gt-xs">View</div>
        <div class="cursor-pointer gt-xs">Window</div>
        <div class="cursor-pointer">Help</div>
        <q-space />
        <q-btn dense flat icon="minimize" />
        <q-btn dense flat icon="crop_square" />
        <q-btn dense flat icon="close" />
        </q-bar>

    </div>

    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6 text-center">🚀 My First Quasar Page</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="name"
          label="Your Name"
          outlined
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Say Hello"
          @click="sayHello"
          class="full-width"
        />
      </q-card-section>

      <q-card-section v-if="greeting">
        <q-banner class="bg-green text-white text-center q-pa-sm">
          {{ greeting }}
        </q-banner>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ChannelsBar from 'src/components/ChannelsBar.vue'

  const name = ref('')
  const greeting = ref('')

  function sayHello() {
    greeting.value = name.value
      ? `Hello, ${name.value}! 👋`
      : 'Hello there!';
  }
  </script>

  <style scoped>
  .full-width {
    width: 100%;
  }
</style>