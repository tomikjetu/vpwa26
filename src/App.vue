<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { initSocket, disconnectSocket } from 'src/services/socketService'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()

// Initialize socket when app mounts if user is authenticated
onMounted(() => {
  if (authStore.checkAuthenticated) {
    try {
      initSocket()
      console.log('✅ Socket initialized on app mount')
    } catch (error) {
      console.error('Failed to initialize socket:', error)
    }
  }
})

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated && authStore.token) {
      // User logged in, initialize socket
      try {
        initSocket()
        console.log('✅ Socket initialized on login')
      } catch (error) {
        console.error('Failed to initialize socket on login:', error)
      }
    } else {
      // User logged out, disconnect socket
      disconnectSocket()
      console.log('🔌 Socket disconnected on logout')
    }
  }
)
</script>
