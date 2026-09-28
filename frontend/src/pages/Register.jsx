import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Register() {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


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

      sessionStorage.setItem(
        "verificationEmail",
        form.email
      );

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

    <div
  className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
  style={{
    backgroundImage: "url('/farm-background.svg')",
  }}
>

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h1>


        {error && (

          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">

            {error}

          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />


          {/* EMAIL */}

          <input
            type="email"
            name="email"
            placeholder="Gmail Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />


          {/* PHONE */}

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />


          {/* PASSWORD */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />


          <p className="text-sm text-gray-500">

            Password must contain at least 8 characters,
            including uppercase, lowercase, number,
            and special character.

          </p>


          {/* REGISTER */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"
            }

          </button>

        </form>

      </div>

    </div>

  );

}