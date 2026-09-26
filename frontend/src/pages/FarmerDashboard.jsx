import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Could not load your rental requests."));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-farmgreen-700 mb-1">
        Welcome, {user?.name}
      </h2>
      <p className="text-gray-500 mb-6">My Rental Requests</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <p className="text-gray-500">You haven't sent any rental requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm text-sm">
            <thead>
              <tr className="text-left border-b bg-farmgreen-50">
                <th className="p-3">Equipment</th>
                <th className="p-3">Booking Date</th>
                <th className="p-3">Total Price</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-none">
                  <td className="p-3">{b.equipment_name}</td>
                  <td className="p-3">
                    {new Date(b.start_date).toLocaleDateString()} -{" "}
                    {new Date(b.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-3">₹{b.total_price}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
