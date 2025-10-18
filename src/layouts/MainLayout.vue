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

                <q-toggle v-model="darkMode" label="Dark Mode" class="q-mb-sm" />

                <div class="row items-center">
                  <q-btn
                    outline
                    size="sm"
                    class="q-mr-sm"
                    :style="{ color: 'rgb(60, 60, 60)'}"
                  >
                    <q-icon name="circle" :color="stateColor" size="18px" class="q-mr-sm" />
                    <label>{{ userState }}</label>
                    <q-menu ref="stateMenu">
                      <q-list style="min-width: 120px">
                        <q-item clickable v-ripple @click.stop="setUserState('online')">
                          <q-item-section avatar>
                            <q-icon name="circle" color="green" size="18px" />
                          </q-item-section>
                          <q-item-section>Online</q-item-section>
                        </q-item>

                        <q-item clickable v-ripple @click.stop="setUserState('dnd')">
                          <q-item-section avatar>
                            <q-icon name="circle" color="orange" size="18px" />
                          </q-item-section>
                          <q-item-section>Do Not Disturb</q-item-section>
                        </q-item>

                        <q-item clickable v-ripple @click.stop="setUserState('offline')">
                          <q-item-section avatar>
                            <q-icon name="circle" color="red" size="18px" />
                          </q-item-section>
                          <q-item-section>Offline</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar size="72px" icon="person" />

                <div class="row items-center text-subtitle1 q-mb-xs">
                  <q-icon
                    name="circle"
                    size="18px"
                    class="q-mr-xs"
                    :color="stateColor"
                  />
                  <span>{{ currentUser.name }}</span>
                </div>

                <q-btn
                  color="red"
                  icon="logout"
                  label="Logout"
                  @click="logout"
                  size="md"
                  v-close-popup
                />
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify, Dialog } from 'quasar';
import { authService } from 'src/services/authService';
import { useAuthStore } from 'src/stores/auth-store';
import CommandLine from 'src/components/CommandLine.vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia'
import { useContacts } from 'src/stores/contacts-store'

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

const contacts = useContacts()
const { getCurrentUser } = storeToRefs(authStore)
const userState = ref<'online' | 'dnd' | 'offline'>('online')
const stateMenu = ref()

// Set state via menu
function setUserState(state: 'online' | 'dnd' | 'offline') {
  if (!getCurrentUser.value) return
  userState.value = state
  stateMenu.value?.hide()

  contacts.updateStatus(getCurrentUser.value?.id, state)
}

// Computed color for current state
const stateColor = computed(() => {
  switch (userState.value) {
    case 'online':
      return 'green'
    case 'dnd':
      return 'orange'
    case 'offline':
      return 'red'
    default:
      return 'grey' // fallback color
  }
})
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