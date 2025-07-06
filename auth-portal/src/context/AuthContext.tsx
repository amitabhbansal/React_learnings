import { createContext, useContext, useEffect, useState } from "react";
import { Role, type User } from "../types/User";
import { toast } from "react-toastify";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  changeUserRole: (username: string, newRole: Role) => void;
}

// Full user with password, kept in memory only
type FakeUser = User & { password: string };

// In-memory login-only store (DO NOT persist!)
const initialUsers: FakeUser[] = [
  { username: "superadmin", password: "root123", role: Role.SUPERADMIN },
  { username: "user1", password: "user123", role: Role.ADMIN },
  { username: "user2", password: "user456", role: Role.USER },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users and session from localStorage on first mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedUsers = localStorage.getItem("users");

    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Populate display users (without passwords) on first load
      const displayUsers = initialUsers.map(({ password, ...rest }) => rest);
      setUsers(displayUsers);
      localStorage.setItem("users", JSON.stringify(displayUsers));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const found = initialUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (found) {
      const { password, ...userInfo } = found;
      setCurrentUser(userInfo);
      localStorage.setItem("currentUser", JSON.stringify(userInfo));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const changeUserRole = (username: string, newRole: Role) => {
    if (currentUser?.role !== Role.SUPERADMIN || username === "superadmin")
      return;

    // Update users state (UI)
    const updatedUsers = users.map((u) =>
      u.username === username ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Also update in-memory login users
    initialUsers.forEach((u) => {
      if (u.username === username) {
        u.role = newRole;
      }
    });
    toast.success(`Role updated for ${username}`);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, users, changeUserRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
