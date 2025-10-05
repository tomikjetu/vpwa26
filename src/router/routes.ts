import type { RouteRecordRaw } from 'vue-router';
import { requireAuth, requireGuest } from './middleware';

const routes: RouteRecordRaw[] = [
  // Authentication routes
  {
    path: '/auth',
    component: () => import('layouts/LoginLayout.vue'),
    beforeEnter: requireGuest, // Only allow guests (non-authenticated users)
    children: [
      {
        path: '',
        redirect: '/auth/login',
      },
      {
        path: 'login',
        component: () => import('pages/Auth/LoginPage.vue'),
      },
      {
        path: 'register',
        component: () => import('pages/Auth/RegisterPage.vue'),
      },
    ],
  },

  // Protected routes (require authentication)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth, // Require authentication for all child routes
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
