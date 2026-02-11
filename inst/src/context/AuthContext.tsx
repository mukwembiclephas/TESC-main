// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import apiClient from "@/services/api";
import { useNavigate } from "react-router-dom";

// 1. Update User interface to match what Sidebar expects (nested institution object)
interface Institution {
  id: number;
  name: string;
  email?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution: Institution; // Changed from institution_id to object
}

interface AuthContextType {
  user: User | null;
  // 2. Add login function definition
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/instauth/profile/");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
      // Optional: if profile fetch fails (e.g. invalid token), clear storage
      // localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false); // Stop loading if no token
    }
  }, []);

  // 3. Implement the login function
  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Crucial: Fetch profile immediately after setting tokens
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};