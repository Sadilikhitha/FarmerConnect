import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);

    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);

    // Registration now only sends the OTP.
    // It does NOT log the user in yet.
    return res.data;
  };

  const verifyEmail = async (email, otp) => {
    const res = await api.post("/auth/verify-email", {
      email,
      otp,
    });

    // Verification returns a login token.
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);

    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post("/auth/resend-otp", {
      email,
    });

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

