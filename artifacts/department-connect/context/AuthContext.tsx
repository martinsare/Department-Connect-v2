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

export type UserRole = "student" | "admin" | "developer";
export type AdminSubRole =
  | "Lecturer"
  | "Course Representative"
  | "Department Executive";

export interface AuthUser {
  id: string;
  firstName: string;
  surname: string;
  role: UserRole;
  matricNumber?: string;
  staffId?: string;
  level?: string;
  department: string;
  phone: string;
  email: string;
  dob?: string;
  status?: string;
  subRole?: AdminSubRole;
  birthdayPrivacy?: boolean;
  hideYear?: boolean;
  profilePicture?: string;
}

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

const DEMO_STUDENTS: (AuthUser & { password: string })[] = [
  {
    id: "s1",
    firstName: "Tolu",
    surname: "Adeyemi",
    role: "student",
    matricNumber: "ART2500001",
    level: "300L",
    department: "Computer Science",
    phone: "08012345678",
    email: "tolu.adeyemi@example.com",
    dob: "1998-03-15",
    status: "active",
    birthdayPrivacy: true,
    hideYear: true,
    password: "password",
  },
  {
    id: "s2",
    firstName: "Chidi",
    surname: "Okonkwo",
    role: "student",
    matricNumber: "ART2500002",
    level: "300L",
    department: "Computer Science",
    phone: "08023456789",
    email: "chidi@example.com",
    dob: "1998-07-22",
    status: "active",
    birthdayPrivacy: false,
    password: "password",
  },
  {
    id: "s3",
    firstName: "Fatima",
    surname: "Bello",
    role: "student",
    matricNumber: "ART2500003",
    level: "200L",
    department: "Computer Science",
    phone: "08034567890",
    email: "",
    dob: "2000-11-05",
    status: "pending",
    birthdayPrivacy: false,
    password: "password",
  },
  {
    id: "s4",
    firstName: "Peter",
    surname: "Nwosu",
    role: "student",
    matricNumber: "ART2500004",
    level: "400L",
    department: "Computer Science",
    phone: "08045678901",
    email: "peter@example.com",
    dob: "1997-05-18",
    status: "active",
    birthdayPrivacy: true,
    password: "password",
  },
  {
    id: "s5",
    firstName: "Kemi",
    surname: "Adesanya",
    role: "student",
    matricNumber: "ART2500005",
    level: "100L",
    department: "Computer Science",
    phone: "08056789012",
    email: "",
    dob: "2002-01-30",
    status: "rejected",
    birthdayPrivacy: false,
    password: "password",
  },
  {
    id: "s6",
    firstName: "Emmanuel",
    surname: "Obi",
    role: "student",
    matricNumber: "ART2500006",
    level: "300L",
    department: "Computer Science",
    phone: "08067890123",
    email: "",
    dob: "1998-09-12",
    status: "pending",
    birthdayPrivacy: false,
    password: "password",
  },
  {
    id: "s7",
    firstName: "Rukayat",
    surname: "Lawal",
    role: "student",
    matricNumber: "ART2500007",
    level: "200L",
    department: "Computer Science",
    phone: "08078901234",
    email: "rukayat@example.com",
    dob: "2000-04-25",
    status: "active",
    birthdayPrivacy: true,
    password: "password",
  },
  {
    id: "s8",
    firstName: "Michael",
    surname: "Eze",
    role: "student",
    matricNumber: "ART2500008",
    level: "400L",
    department: "Computer Science",
    phone: "08089012345",
    email: "michael@example.com",
    dob: "1997-12-03",
    status: "active",
    birthdayPrivacy: true,
    password: "password",
  },
];

const DEMO_ADMINS: (AuthUser & { password: string })[] = [
  {
    id: "a1",
    firstName: "Yusuf",
    surname: "Ibrahim",
    role: "admin",
    staffId: "LEC001",
    subRole: "Lecturer",
    department: "Computer Science",
    phone: "08011223344",
    email: "yusuf.ibrahim@csc.edu",
    password: "password",
  },
  {
    id: "a2",
    firstName: "Sandra",
    surname: "Okafor",
    role: "admin",
    staffId: "REP001",
    subRole: "Course Representative",
    level: "300L",
    department: "Computer Science",
    phone: "08022334455",
    email: "sandra.okafor@csc.edu",
    password: "password",
  },
  {
    id: "a3",
    firstName: "James",
    surname: "Adeleke",
    role: "admin",
    staffId: "EXE001",
    subRole: "Department Executive",
    department: "Computer Science",
    phone: "08033445566",
    email: "james.adeleke@csc.edu",
    password: "password",
  },
];

const DEMO_DEV: AuthUser & { password: string } = {
  id: "d1",
  firstName: "Dev",
  surname: "Martins",
  role: "developer",
  staffId: "DEV001",
  department: "System",
  phone: "08099887766",
  email: "dev@departmentconnect.ng",
  password: "password",
};

const STORAGE_KEY = "dc_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminList, setAdminList] = useState<(AuthUser & { password: string })[]>([...DEMO_ADMINS]);
  const adminRef = React.useRef<(AuthUser & { password: string })[]>([...DEMO_ADMINS]);
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
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
      const allUsers = [...DEMO_STUDENTS, ...adminRef.current, DEMO_DEV, ...registeredStudentsStore];
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

      if (found.role === "student" && found.status === "pending") {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Your account is pending approval by your Lecturer or Course Representative.",
        };
      }

      if (found.role === "student" && found.status === "rejected") {
        setIsLoading(false);
        return {
          success: false,
          error: "Your account was rejected. Please contact Admin.",
        };
      }

      const { password: _p, ...safeUser } = found;
      setUser(safeUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
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
    await AsyncStorage.removeItem(STORAGE_KEY);
    router.replace("/login");
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
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
