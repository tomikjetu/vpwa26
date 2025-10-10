import type { User, LoginCredentials, RegisterCredentials } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth-store';

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
      // TODO: Replace this with actual API call
      // For now, simulate API call with mock data
      await this.simulateApiDelay();

      // Mock authentication - in real app, this would be an API call
      if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        const user: User = {
          id: 1,
          name: 'John',
          surname: 'Doe',
          nickName: 'johndoe',
          email: credentials.email,
        };

        const token = 'mock-jwt-token-' + Date.now();
        this.getAuthStore().setAuth(token, user);
        return user;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // TODO: Replace this with actual API call
      await this.simulateApiDelay();

      // Mock registration - in real app, this would be an API call
      const user: User = {
        id: Number(Date.now().toString()),
        name: credentials.name,
        surname: credentials.surname,
        nickName: credentials.nickName,
        email: credentials.email,
      };

      const token = 'mock-jwt-token-' + Date.now();
      this.getAuthStore().setAuth(token, user);
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
  async refreshToken(): Promise<string> {
    try {
      // TODO: Replace this with actual API call
      await this.simulateApiDelay();

      const newToken = 'refreshed-mock-jwt-token-' + Date.now();
      this.getAuthStore().updateToken(newToken);
      return newToken;
    } catch {
      this.getAuthStore().clearAuth();
      throw new Error('Token refresh failed');
    }
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
