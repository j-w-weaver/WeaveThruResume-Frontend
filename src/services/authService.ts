import api from "../utils/api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types";

// ============================================
// AUTH SERVICE
// (Handles all authentication-related API calls)
// ============================================

/**
 * AuthService - handles user authentication operations.
 */
class AuthService {
  /**
   * Registers a new user.
   *
   * @param data - User registration data
   * @returns Promise with auth response (token + user)
   *
   * C# equivalent:
   * public async Task<AuthResponse> Register(RegisterRequest data)
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);

    // Store token in localStorage for future requests
    this.setToken(response.data.token);

    return response.data;
  }

  /**
   * Logs in an existing user.
   *
   * @param data - User login credentials
   * @returns Promise with auth response (token + user)
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);

    // Store token in localStorage
    this.setToken(response.data.token);

    return response.data;
  }

  /**
   * Logs out the current user.
   * Clears the stored JWT token.
   */
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  }

  /**
   * Stores JWT token in localStorage.
   *
   * @param token - JWT token string
   */
  private setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  /**
   * Gets stored JWT token from localStorage.
   *
   * @returns JWT token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Checks if user is currently authenticated.
   *
   * @returns true if token exists, false otherwise
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Gets the current user from localStorage.
   *
   * @returns User object or null if not found
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  /**
   * Stores user info in localStorage.
   *
   * @param user - User object to store
   */
  setCurrentUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

// Export a single instance (singleton pattern)
export default new AuthService();
