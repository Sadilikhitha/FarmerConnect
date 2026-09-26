import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "owner" ? "/owner-dashboard" : "/farmer-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 card">
      <h2 className="text-2xl font-bold text-farmgreen-700 mb-4 text-center">
        Login
      </h2>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-farmgreen-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
