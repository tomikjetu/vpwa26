<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title> VPWA 26 </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
        </div>

        <q-btn v-if="currentUser" icon="person" flat round>
          <q-menu class="menu-settings">
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-toggle v-model="darkMode" label="Dark Mode" />
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar size="72px" icon="person" />

                <div class="text-subtitle1 q-mb-xs">{{ currentUser.name }}</div>

                <q-btn color="red" icon="logout" label="Logout" @click="logout" size="md" v-close-popup />
              </div>
            </div>
          </q-menu>
        </q-btn>

      </q-toolbar>
    </q-header>

    <CommandLine />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, Dialog } from 'quasar';
import { authService } from 'src/services/authService';
import { useAuthStore } from 'src/stores/auth-store';
import CommandLine from 'src/components/CommandLine.vue';

import { useQuasar } from 'quasar';
const dark = useQuasar().dark;

const router = useRouter();
const authStore = useAuthStore();

const currentUser = computed(() => authStore.getCurrentUser);
const darkMode = computed({
  get: () => dark.isActive,
  set: (val: boolean) => {
    dark.set(val);
    localStorage.setItem('darkMode', val ? 'true' : 'false');
  }
});

function logout() {
  Dialog.create({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    authService.logout();

    Notify.create({
      type: 'positive',
      message: 'Successfully logged out',
      position: 'top'
    });

    void router.push('/auth/login');
  });
}
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