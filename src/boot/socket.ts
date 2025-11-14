import { defineBoot } from '#q-app/wrappers';
import { initSocket } from 'src/services/socketService';
import { useAuthStore } from 'src/stores/auth-store';

export default defineBoot(({ router }) => {
  // Initialize socket connection after user is authenticated
  router
    .isReady()
    .then(() => {
      const authStore = useAuthStore();

      // Only initialize socket if user is authenticated
      if (authStore.checkAuthenticated) {
        try {
          initSocket();
          console.log('✅ Socket initialized on app boot');
        } catch (error) {
          console.error('Failed to initialize socket:', error);
        }
      }

      // Watch for authentication changes
      authStore.$subscribe((mutation, state) => {
        if (state.isAuthenticated && state.token) {
          // User logged in, initialize socket
          try {
            initSocket();
          } catch (error) {
            console.error('Failed to initialize socket on login:', error);
          }
        }
      });
    })
    .catch((error) => {
      console.error('Router failed to be ready:', error);
    });
});
