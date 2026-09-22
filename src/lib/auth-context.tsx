import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { loginUserFn, registerUserFn, type LoginInput, type RegisterInput, type UserDTO } from "@/lib/auth-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────
const USER_DATA_KEY = "moc_silk_user_data";        // localStorage: lưu thông tin user
const SESSION_TOKEN_KEY = "moc_silk_session_token"; // sessionStorage: token phiên — tự xóa khi đóng tab

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 phút không hoạt động → tự logout

// Các sự kiện được coi là "hoạt động" của người dùng
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

// ─────────────────────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────────────────────
function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function isSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem(SESSION_TOKEN_KEY);
}

function createSession(): void {
  sessionStorage.setItem(SESSION_TOKEN_KEY, generateSessionToken());
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  isSessionChecked: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // Ref để giữ timeout inactivity
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Logout helper (có thể gọi từ bên trong và bên ngoài timer) ──
  const performLogout = () => {
    setUser(null);
    clearSession();
    // Giữ lại localStorage user data để UX tốt hơn (auto-fill email khi login lại)
    // Nếu muốn xóa hoàn toàn: localStorage.removeItem(USER_DATA_KEY);
  };

  // ── Inactivity timer: reset mỗi khi có hoạt động ──
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      // Chỉ logout nếu đang có session
      if (isSessionActive()) {
        performLogout();
      }
    }, INACTIVITY_TIMEOUT_MS);
  };

  // ── Gắn/tháo event listeners hoạt động ──
  useEffect(() => {
    if (!user) {
      // Không cần theo dõi khi chưa đăng nhập
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    // Bắt đầu đếm ngay khi user đăng nhập
    resetInactivityTimer();

    const handleActivity = () => resetInactivityTimer();

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [user]);

  // ── Load user on mount: chỉ restore nếu session còn sống ──
  useEffect(() => {
    try {
      const sessionAlive = isSessionActive();
      if (!sessionAlive) {
        // Tab mới / sau khi đóng tab → không restore session
        setIsSessionChecked(true);
        return;
      }
      const stored = localStorage.getItem(USER_DATA_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      clearSession();
      localStorage.removeItem(USER_DATA_KEY);
    }
    setIsSessionChecked(true);
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
        // Lưu user data vào localStorage (thông tin lâu dài)
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        // Tạo session token vào sessionStorage (tự xóa khi đóng tab)
        createSession();
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
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        createSession();
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
    performLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSessionChecked,
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

