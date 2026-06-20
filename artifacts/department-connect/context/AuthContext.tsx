import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";
import { registeredStudentsStore } from "./registeredStudentsStore";
import { registeredTeachersStore } from "./registeredTeachersStore";

export type { UserRole, AdminSubRole, AuthUser } from "@/data/types";
import type { UserRole, AdminSubRole, AuthUser } from "@/data/types";

import {
  DEMO_STUDENTS,
  DEMO_ADMINS,
  DEMO_DEV,
  AUTH_STORAGE_KEY,
} from "@/data/seedData";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  addAdmin: (admin: Omit<AuthUser, "id"> & { password: string }) => void;
  allUsers: (AuthUser & { password: string })[];
  profilePictures: Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminList, setAdminList] = useState<(AuthUser & { password: string })[]>([...DEMO_ADMINS]);
  const adminRef = React.useRef<(AuthUser & { password: string })[]>([...DEMO_ADMINS]);
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          setUser(parsed);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const addAdmin = useCallback((admin: Omit<AuthUser, "id"> & { password: string }) => {
    const newAdmin: AuthUser & { password: string } = { ...admin, id: `a${Date.now()}` };
    adminRef.current = [...adminRef.current, newAdmin];
    setAdminList([...adminRef.current]);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 600));

      const lower = identifier.toLowerCase().trim();
      const allUsers = [
        ...DEMO_STUDENTS,
        ...adminRef.current,
        DEMO_DEV,
        ...registeredStudentsStore,
        ...registeredTeachersStore,
      ];
      const found = allUsers.find(
        (u) =>
          u.matricNumber?.toLowerCase() === lower ||
          u.surname.toLowerCase() === lower ||
          u.staffId?.toLowerCase() === lower
      );

      if (!found) {
        setIsLoading(false);
        return { success: false, error: "No account found with that identifier" };
      }

      if (found.password !== password) {
        setIsLoading(false);
        return { success: false, error: "Incorrect password" };
      }

      if (found.status === "pending") {
        setIsLoading(false);
        return {
          success: false,
          error:
            found.role === "admin"
              ? "Your teacher account is pending approval by Super Admin."
              : "Your account is pending approval by your Lecturer or Course Representative.",
        };
      }

      if (found.status === "rejected") {
        setIsLoading(false);
        return { success: false, error: "Your account was rejected. Please contact Admin." };
      }

      const { password: _p, ...safeUser } = found;
      setUser(safeUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
      setIsLoading(false);

      if (safeUser.role === "student") router.replace("/(student)/");
      else if (safeUser.role === "admin") router.replace("/(admin)/");
      else router.replace("/(developer)/");

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace("/login");
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      if (updates.profilePicture) {
        setProfilePictures((pics) => ({ ...pics, [prev.id]: updates.profilePicture! }));
      }
      return updated;
    });
  }, []);

  const allUsers = React.useMemo(
    () => [...DEMO_STUDENTS, ...adminList, DEMO_DEV],
    [adminList]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser, addAdmin, allUsers, profilePictures }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
