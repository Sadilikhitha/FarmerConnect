import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import api from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const loadUser = async () => {

    const token = localStorage.getItem("token");

    if (!token) {

      setLoading(false);

      return;

    }

    try {

      const response = await api.get(
        "/auth/me"
      );

      setUser(response.data);

    } catch (error) {

      localStorage.removeItem("token");

      setUser(null);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadUser();

  }, []);


  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (formData) => {

    const response = await api.post(
      "/auth/register",
      formData
    );

    return response.data;

  };


  // =====================================================
  // VERIFY EMAIL
  // =====================================================

  const verifyEmail = async (
    email,
    otp
  ) => {

    const response = await api.post(
      "/auth/verify-email",
      {
        email,
        otp,
      }
    );

    const data = response.data;

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data.user) {
      setUser(data.user);
    }

    return data;

  };


  // =====================================================
  // RESEND OTP
  // =====================================================

  const resendOtp = async (email) => {

    const response = await api.post(
      "/auth/resend-otp",
      {
        email,
      }
    );

    return response.data;

  };


  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
    email,
    password
  ) => {

    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const data = response.data;

    localStorage.setItem(
      "token",
      data.access_token
    );

    setUser(data.user);

    return data;

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem("token");

    setUser(null);

  };


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        verifyEmail,
        resendOtp,
        login,
        logout,
        loadUser,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  return useContext(AuthContext);

}