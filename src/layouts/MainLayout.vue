<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title> VPWA 26 </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <span v-if="currentUser" class="text-caption">Welcome, {{ currentUser.name }}</span>
          <q-btn v-if="currentUser" flat round dense icon="logout" @click="logout" title="Logout" />
          <div class="text-caption">Quasar v{{ $q.version }}</div>
        </div>
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

const router = useRouter();
const authStore = useAuthStore();

const currentUser = computed(() => authStore.getCurrentUser);

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