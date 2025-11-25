import { defineBoot } from '#q-app/wrappers';

// Socket initialization moved to App.vue for proper timing
// This boot file is kept for potential future socket configuration
export default defineBoot(() => {
  console.log('Socket boot file loaded - initialization handled in App.vue');
});

