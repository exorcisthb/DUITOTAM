import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginUserFn, registerUserFn, type LoginInput, type RegisterInput, type UserDTO } from "@/lib/auth-fns";

interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: "login" | "register") => void;
  login: (data: LoginInput) => Promise<{ success: boolean; error?: string; user?: UserDTO }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string; user?: UserDTO }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "moc_silk_user_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Load user from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await loginUserFn({ data });
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        setIsAuthModalOpen(false);
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error || "Đăng nhập không thành công." };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: "Lỗi kết nối máy chủ. Vui lòng thử lại sau." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await registerUserFn({ data });
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        setIsAuthModalOpen(false);
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error || "Đăng ký không thành công." };
    } catch (err: any) {
      console.error("Register error:", err);
      return { success: false, error: "Lỗi kết nối máy chủ. Vui lòng thử lại sau." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
