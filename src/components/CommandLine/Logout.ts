import { authService } from 'src/services/authService';
export default function logout() {
  return {
    cmd: 'logout',
    execute: () => {
      authService.logout();
      window.location.href = '/auth/login';
    },
  };
}
