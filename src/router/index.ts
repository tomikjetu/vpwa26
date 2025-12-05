import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Define protected routes
  const appRoutes = ['/'];

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth =
      to.matched.some((record) => record.meta.requiresAuth) ||
      appRoutes.some((route) =>
        route === '/' ? to.path === '/' : to.path === route || to.path.startsWith(route + '/'),
      );
    const isAuthPage = to.path.startsWith('/auth/');

    // 🔥 Only check if token exists, do NOT verify via API
    if (requiresAuth && authStore.getToken) {
      return next();
    }

    // ❌ No token -> redirect to login
    if (requiresAuth && !authStore.getToken) {
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    }

    // 🚫 Already authenticated -> prevent visiting auth pages
    if (isAuthPage && authStore.checkAuthenticated) {
      return next('/');
    }

    // ✅ Continue navigation normally
    next();
  });

  return Router;
});
