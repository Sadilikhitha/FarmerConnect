import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "owner" ? "/owner-dashboard" : "/farmer-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h2 className="text-2xl font-bold text-farmgreen-700 mb-4 text-center">
        Register
      </h2>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          placeholder="Full Name"
          className="input-field"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input-field"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          className="input-field"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input-field"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="role"
              value="farmer"
              checked={form.role === "farmer"}
              onChange={handleChange}
            />
            Farmer
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="role"
              value="owner"
              checked={form.role === "owner"}
              onChange={handleChange}
            />
            Equipment Owner
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">
          Create Account
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-farmgreen-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
