import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";
import { api, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/utils/apiClient";

export type { UserRole, AdminSubRole, AuthUser } from "@/data/types";
import type { UserRole, AdminSubRole, AuthUser } from "@/data/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  addAdmin: (admin: Omit<AuthUser, "id"> & { password: string }) => Promise<void>;
  allUsers: AuthUser[];
  profilePictures: Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({});

  // Restore session from storage on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (stored) setUser(JSON.parse(stored) as AuthUser);
      } catch {}
      finally { setIsLoading(false); }
    };
    restore();
  }, []);

  // Load all users for admin/dev views (only when user is set and is admin/dev)
  useEffect(() => {
    if (!user || user.role === "student") return;
    api.get<AuthUser[]>("/api/profiles").then(setAllUsers).catch(() => {});
  }, [user?.id]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const { token, user: apiUser } = await api.post<{ token: string; user: AuthUser }>(
          "/api/auth/login",
          { identifier: identifier.trim(), password }
        );
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(apiUser));
        setUser(apiUser);
        setIsLoading(false);

        if (apiUser.role === "student") router.replace("/(student)/");
        else if (apiUser.role === "admin") router.replace("/(admin)/");
        else router.replace("/(developer)/");

        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message ?? "Login failed" };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setAllUsers([]);
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    router.replace("/login");
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      const updated = await api.patch<AuthUser>("/api/auth/me", updates);
      setUser(updated);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      if (updates.profilePicture) {
        setProfilePictures((pics) => ({ ...pics, [updated.id]: updates.profilePicture! }));
      }
    } catch {}
  }, []);

  const addAdmin = useCallback(async (admin: Omit<AuthUser, "id"> & { password: string }) => {
    try {
      const created = await api.post<AuthUser>("/api/auth/register", { ...admin, role: "admin" });
      setAllUsers((prev) => [...prev, created]);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser, addAdmin, allUsers, profilePictures }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
