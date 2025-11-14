import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth-store';
import { api } from 'src/boot/axios';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Global navigation guard - verify authentication on protected routes
  const appRoutes = ['/'];
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth =
      to.matched.some((record) => record.meta.requiresAuth) ||
      appRoutes.some((route) =>
        route === '/' ? to.path === '/' : to.path === route || to.path.startsWith(route + '/'),
      );
    const isAuthPage = to.path.startsWith('/auth/');

    // If route requires auth and we have a token, verify it with backend
    if (requiresAuth && authStore.getToken) {
      try {
        // Verify token is still valid with /user/me
        const response = await api.get('/user/me');
        if (response.data) next();
        else
          next({
            path: '/auth/login',
            query: { redirect: to.fullPath },
          });
      } catch (error) {
        // Token is invalid, clear auth and redirect to login
        authStore.clearAuth();
        console.error('Token verification failed:', error);
        next({
          path: '/auth/login',
          query: { redirect: to.fullPath },
        });
      }
    } else if (requiresAuth && !authStore.getToken) {
      // No token, redirect to login
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    } else if (isAuthPage && authStore.checkAuthenticated) {
      // Already authenticated, redirect away from auth pages
      next('/');
    } else {
      // No restrictions, proceed
      next();
    }
  });

  return Router;
});
