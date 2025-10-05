import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  const pinia = createPinia();

  pinia.use(
    createPersistedState({
      storage: localStorage,
      key: (id) => `vpwa26-${id}`,
    }),
  );

  app.use(pinia);
});
