import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, hasAuthToken, login as apiLogin, setAuthToken, clearAuthToken } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (hasAuthToken()) {
        try {
          const userData = await fetchMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session", error);
          clearAuthToken();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    setAuthToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
