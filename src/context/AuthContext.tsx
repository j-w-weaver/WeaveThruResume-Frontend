import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import authService from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      console.log("🔍 Initializing auth...");
      console.log("Token:", token ? "Found" : "Not found");
      console.log("User:", savedUser);

      if (token && savedUser) {
        setUser(savedUser);
        console.log("✅ User restored from storage:", savedUser.email);
      } else {
        console.log("❌ No valid session found");
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      const response = await authService.login(data);
      setUser(response.user);
      authService.setCurrentUser(response.user);
      console.log("✅ Login successful:", response.user.email);
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      authService.setCurrentUser(response.user);
      console.log("✅ Registration successful:", response.user.email);
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
    console.log("✅ Logged out");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
