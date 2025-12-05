import { useAuthStore } from 'src/stores/auth';
export default function logout() {
  const auth = useAuthStore();
  return {
    cmd: 'logout',
    execute: async () => {
      await auth.logout();
      window.location.href = '/auth/login';
    },
  };
}
