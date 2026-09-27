import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");
    setSavingProfile(true);

    try {
      await api.put("/auth/profile", {
        name: profile.name,
        phone: profile.phone,
      });

      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err.response?.data?.detail ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (password.new_password !== password.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await api.put("/auth/change-password", password);

      setPasswordMessage(res.data.message);

      setPassword({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.detail ||
          "Unable to change password. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 space-y-6">
      {/* Profile */}
      <div className="card">
        <h2 className="text-2xl font-bold text-farmgreen-700 mb-6">
          Profile & Settings
        </h2>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              className="input-field"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Gmail
            </label>

            <div className="flex gap-2 items-center">
              <input
                type="email"
                className="input-field bg-gray-100"
                value={user?.email || ""}
                disabled
              />

              <span className="text-green-600 text-sm font-semibold whitespace-nowrap">
                ✓ Verified
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              className="input-field"
              value={profile.phone}
              onChange={handleProfileChange}
              required
            />
          </div>

          {profileError && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded">
              {profileError}
            </p>
          )}

          {profileMessage && (
            <p className="bg-green-50 text-green-700 text-sm p-2 rounded">
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={savingProfile}
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-xl font-bold text-farmgreen-700 mb-5">
          Change Password
        </h3>

        <form onSubmit={changePassword} className="space-y-4">
          <input
            type="password"
            name="current_password"
            placeholder="Current Password"
            className="input-field"
            value={password.current_password}
            onChange={handlePasswordChange}
            required
          />

          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            className="input-field"
            value={password.new_password}
            onChange={handlePasswordChange}
            required
          />

          <p className="text-xs text-gray-500">
            Password must contain at least 8 characters, one uppercase
            letter, one lowercase letter, one number, and one special
            character.
          </p>

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm New Password"
            className="input-field"
            value={password.confirm_password}
            onChange={handlePasswordChange}
            required
          />

          {passwordError && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="bg-green-50 text-green-700 text-sm p-2 rounded">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={changingPassword}
          >
            {changingPassword ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="card">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
