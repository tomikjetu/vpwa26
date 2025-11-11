import type { User, LoginCredentials, RegisterCredentials } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth-store';
import { api } from '../boot/axios';
import { type RegisterData, type LoginData } from 'src/utils/apiTypes';

class AuthService {
  private getAuthStore() {
    return useAuthStore();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthStore().checkAuthenticated;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.getAuthStore().getToken;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.getAuthStore().getCurrentUser;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<LoginData>('/user/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const user: User = {
        id: response.data.user.id,
        name: response.data.user.first_name,
        surname: response.data.user.last_name,
        nickName: response.data.user.nick,
        email: response.data.user.email,
      };

      this.getAuthStore().setAuth(response.data.sessionToken, user);
      return user;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
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

      const user: User = {
        id: response.data.user.id,
        name: response.data.user.first_name,
        surname: response.data.user.last_name,
        nickName: response.data.user.nick,
        email: response.data.user.email,
      };

      this.getAuthStore().setAuth(response.data.sessionToken, user);
      return user;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.getAuthStore().clearAuth();
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): string {
    return '';
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!this.isAuthenticated() || !currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // TODO: Replace this with actual API call
      await this.simulateApiDelay();

      const updatedUser: User = {
        ...currentUser,
        ...userData,
        id: currentUser.id, // Ensure ID cannot be changed
      };

      this.getAuthStore().updateUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Profile update failed');
    }
  }

  /**
   * Simulate API delay for development
   */
  private async simulateApiDelay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const authService = new AuthService();
