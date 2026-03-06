import { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  level?: number;
  xp?: number;
  streak?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = sessionStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        setLoading(false);
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      try {
        const { data } = await api.get("/auth/profile");
        const profile = data.user || data;
        const normalizedUser = {
          id: profile.id || profile._id,
          name: profile.name,
          email: profile.email,
          level: profile.level,
          xp: profile.xp,
          streak: profile.streak,
        };
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } catch {
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

const login = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });

  sessionStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  setUser(data.user);
};

const register = async (name: string, email: string, password: string) => {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  sessionStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  setUser(data.user);
};

  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext error");
  return context;
};
