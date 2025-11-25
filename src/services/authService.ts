import type { User, LoginCredentials, RegisterCredentials } from 'src/utils/types';
import { api } from 'src/boot/axios';
import { type RegisterData, type LoginData } from 'src/utils/apiTypes';

class AuthService {
  // Service methods now only perform HTTP requests and return raw data

  async login(credentials: LoginCredentials): Promise<LoginData> {
    try {
      const response = await api.post<LoginData>('/user/login', {
        email: credentials.email,
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterData> {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await api.post<RegisterData>('/user/register', {
        first_name: credentials.name,
        last_name: credentials.surname,
        nick: credentials.nickName,
        email: credentials.email,
        password: credentials.password,
      });

      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/user/logout');
    } catch (e) {
      console.error('Logout failed', e);
      // ignore network/logout errors for now - client will clear local state regardless
    }
  }

  async updateProfile(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/user/${userId}`, userData);
      // Expecting updated user in `response.data.user` or `response.data`
      return (response.data && (response.data.user ?? response.data)) as User;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Profile update failed');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
