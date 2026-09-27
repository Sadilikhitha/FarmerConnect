import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("verificationEmail");

    if (!savedEmail) {
      navigate("/register");
      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyEmail(email, otp);

      sessionStorage.removeItem("verificationEmail");

      if (result.user.role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/farmer-dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const result = await resendOtp(email);
      setMessage(result.message);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h2 className="text-2xl font-bold text-farmgreen-700 mb-2 text-center">
        Verify Your Gmail
      </h2>

      <p className="text-sm text-gray-600 text-center mb-5">
        We sent a 6-digit verification code to:
      </p>

      <p className="font-semibold text-center mb-5">
        {email}
      </p>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
          {error}
        </p>
      )}

      {message && (
        <p className="bg-green-50 text-green-700 text-sm p-2 rounded mb-3">
          {message}
        </p>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className="input-field text-center text-xl tracking-widest"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          required
        />

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="w-full mt-4 text-farmgreen-600 font-semibold text-sm"
      >
        {resending ? "Sending..." : "Resend OTP"}
      </button>

      <p className="text-sm text-center mt-4 text-gray-600">
        Wrong email?{" "}
        <Link
          to="/register"
          className="text-farmgreen-600 font-semibold"
        >
          Register again
        </Link>
      </p>
    </div>
  );
}

