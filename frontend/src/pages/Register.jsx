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
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);

      // Store email temporarily for OTP verification
      sessionStorage.setItem("verificationEmail", form.email);

      navigate("/verify-otp");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
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
          placeholder="Gmail Address"
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

        <p className="text-xs text-gray-500">
          Password must contain at least 8 characters, one uppercase
          letter, one lowercase letter, one number, and one special
          character.
        </p>

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

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-farmgreen-600 font-semibold"
        >
          Login
        </Link>
      </p>
    </div>
  );
}