import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import authService from "../services/authService";

// ============================================
// AUTH CONTEXT TYPE DEFINITION
// ============================================

/**
 * Shape of the auth context.
 * Defines what data and functions are available.
 *
 * C# equivalent: public interface IAuthContext { ... }
 */
interface AuthContextType {
  // Current authenticated user (null if not logged in)
  user: User | null;

  // Is user currently logged in?
  isAuthenticated: boolean;

  // Is the auth state still loading?
  isLoading: boolean;

  // Login function
  login: (data: LoginRequest) => Promise<void>;

  // Register function
  register: (data: RegisterRequest) => Promise<void>;

  // Logout function
  logout: () => void;
}

// ============================================
// CREATE CONTEXT
// ============================================

/**
 * Create the context with undefined default.
 * We use undefined to force consumers to use the provider.
 *
 * Think of Context like:
 * - A global variable that components can access
 * - But type-safe and React-friendly
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

/**
 * Props for AuthProvider component.
 * ReactNode = any valid React content (like object in C#)
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider wraps your app and provides auth state.
 *
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * C# analogy: Like a dependency injection container
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * useState hook - manages component state.
   *
   * C# analogy:
   * private User? _user;
   * public User? User {
   *   get => _user;
   *   set { _user = value; OnPropertyChanged(); }
   * }
   *
   * But React handles the re-rendering automatically!
   */
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Computed property - user is authenticated if user object exists.
   *
   * C# equivalent:
   * public bool IsAuthenticated => User != null;
   */
  const isAuthenticated = user !== null;

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * useEffect hook - runs side effects.
   * This one runs ONCE when component mounts (empty dependency array []).
   *
   * C# analogy: Like constructor or OnInitialized in Blazor
   */
  useEffect(() => {
    // Check if user is already logged in (from previous session)
    const initializeAuth = () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (token && savedUser) {
        // User was previously logged in
        setUser(savedUser);
      }

      // Done loading
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Empty array = run once on mount

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  /**
   * Login function - authenticates user.
   *
   * @param data - Login credentials
   */
  const login = async (data: LoginRequest): Promise<void> => {
    try {
      // Call backend API
      const response = await authService.login(data);

      // Save user to state
      setUser(response.user);

      // Save user to localStorage (for page refreshes)
      authService.setCurrentUser(response.user);

      console.log("✅ Login successful:", response.user.email);
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error; // Re-throw so component can handle it
    }
  };

  /**
   * Register function - creates new user account.
   *
   * @param data - Registration details
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      // Call backend API
      const response = await authService.register(data);

      // Save user to state
      setUser(response.user);

      // Save user to localStorage
      authService.setCurrentUser(response.user);

      console.log("✅ Registration successful:", response.user.email);
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  };

  /**
   * Logout function - logs out current user.
   */
  const logout = () => {
    // Clear state
    setUser(null);

    // Clear localStorage and redirect
    authService.logout();

    console.log("✅ Logged out");
  };

  // ============================================
  // PROVIDE CONTEXT VALUE
  // ============================================

  /**
   * Value object that will be available to all consumers.
   *
   * Any component can access these via useAuth() hook.
   */
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  /**
   * Render children with context provider.
   *
   * The 'value' prop makes our auth state available to all children.
   */
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// CUSTOM HOOK FOR CONSUMING CONTEXT
// ============================================

/**
 * Custom hook to use auth context.
 *
 * Usage in components:
 * const { user, login, logout } = useAuth();
 *
 * C# analogy: Like dependency injection
 * public MyComponent(IAuthService authService) { ... }
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  // If context is undefined, provider is missing
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
