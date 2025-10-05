import type { User, LoginCredentials, RegisterCredentials } from 'src/utils/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Initialize from localStorage on service creation
    this.loadUserFromStorage();
  }

  /**
   * Load user data from localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);

    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser = user;
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser = null;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
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
          id: '1',
          name: 'John',
          surname: 'Doe',
          nickName: 'johndoe',
          email: credentials.email,
        };

        const token = 'mock-jwt-token-' + Date.now();
        this.saveAuthData(token, user);
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
        id: Date.now().toString(),
        name: credentials.name,
        surname: credentials.surname,
        nickName: credentials.nickName,
        email: credentials.email,
      };

      const token = 'mock-jwt-token-' + Date.now();
      this.saveAuthData(token, user);
      return user;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      // TODO: Replace this with actual API call
      await this.simulateApiDelay();

      const newToken = 'refreshed-mock-jwt-token-' + Date.now();
      localStorage.setItem(TOKEN_KEY, newToken);
      return newToken;
    } catch {
      this.clearAuthData();
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    if (!this.isAuthenticated() || !this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // TODO: Replace this with actual API call
      await this.simulateApiDelay();

      const updatedUser: User = {
        ...this.currentUser,
        ...userData,
        id: this.currentUser.id, // Ensure ID cannot be changed
      };

      const token = this.getToken()!;
      this.saveAuthData(token, updatedUser);
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
