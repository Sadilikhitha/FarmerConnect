import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Equipment from "./pages/Equipment";
import EquipmentDetails from "./pages/EquipmentDetails";
import AddEquipment from "./pages/AddEquipment";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route
  path="/settings"
  element={
    <PrivateRoute>
      <Settings />
    </PrivateRoute>
  }
/>
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />

          <Route
            path="/add-equipment"
            element={
              <PrivateRoute>
                <AddEquipment />
              </PrivateRoute>
            }
          />

        </Routes>
      </main>
    </div>
  );
}