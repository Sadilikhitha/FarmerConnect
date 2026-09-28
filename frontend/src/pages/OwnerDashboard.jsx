import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = () => {
    api
      .get("/equipment/mine")
      .then((res) => setEquipment(res.data))
      .catch(() => setError("Could not load your equipment."));

    api
      .get("/bookings/owner")
      .then((res) => setRequests(res.data))
      .catch(() => setError("Could not load rental requests."));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle equipment availability
  const handleAvailability = async (item) => {
    setError("");
    setUpdatingId(item.id);

    try {
      const res = await api.put(`/equipment/${item.id}`, {
        available: !item.available,
      });

      // Update only this equipment on the screen
      setEquipment((current) =>
        current.map((equipmentItem) =>
          equipmentItem.id === item.id
            ? res.data
            : equipmentItem
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update equipment availability."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecision = async (id, action) => {
    setError("");

    try {
      await api.put(`/bookings/${id}/${action}`);
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update the booking."
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <p className="text-sm text-farmgreen-600 font-semibold">
            Owner Dashboard
          </p>

          <h2 className="text-3xl font-bold text-farmgreen-700">
            Welcome, {user?.name}
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your equipment and rental requests.
          </p>
        </div>

        <Link
          to="/add-equipment"
          className="btn-primary text-sm text-center"
        >
          + Add Equipment
        </Link>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mt-5">
          {error}
        </div>
      )}

      {/* My Equipment */}
      <div className="mt-8">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-farmgreen-700">
            My Equipment
          </h3>

          <span className="text-sm text-gray-500">
            {equipment.length} item
            {equipment.length !== 1 ? "s" : ""}
          </span>
        </div>

        {equipment.length === 0 ? (

          <div className="card text-center py-10">
            <div className="text-5xl mb-3">🚜</div>

            <p className="font-semibold text-gray-700">
              You haven't listed any equipment yet.
            </p>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Add your tractor, tools or other farming equipment.
            </p>

            <Link
              to="/add-equipment"
              className="btn-primary inline-block"
            >
              + Add Equipment
            </Link>
          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">

            {equipment.map((item) => (

              <div
                key={item.id}
                className="card hover:shadow-md transition-shadow"
              >

                {/* Equipment name */}
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {item.name}
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.category} · {item.location}
                    </p>
                  </div>

                  {/* Availability badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      item.available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.available
                      ? "🟢 Available"
                      : "🔴 Unavailable"}
                  </span>

                </div>

                {/* Price */}
                <p className="text-lg font-bold text-farmgreen-600 mt-4">
                  ₹{item.price_per_day}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / day
                  </span>
                </p>

                {/* Availability information */}
                <div
                  className={`mt-4 p-3 rounded-xl text-sm ${
                    item.available
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.available
                    ? "This equipment is currently available for rent."
                    : "This equipment is currently unavailable for rent."}
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => handleAvailability(item)}
                  disabled={updatingId === item.id}
                  className={`w-full mt-4 py-2.5 rounded-xl font-semibold transition ${
                    item.available
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  } ${
                    updatingId === item.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {updatingId === item.id
                    ? "Updating..."
                    : item.available
                    ? "Make Unavailable"
                    : "Make Available"}
                </button>

              </div>

            ))}

          </div>
        )}
      </div>

      {/* Rental requests */}
      <section>

        <h3 className="text-xl font-bold text-farmgreen-700 mb-4">
          Rental Requests Received
        </h3>

        {requests.length === 0 ? (

          <div className="card">
            <p className="text-gray-500">
              No rental requests yet.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto rounded-2xl shadow-sm">

            <table className="w-full bg-white text-sm">

              <thead>
                <tr className="text-left border-b bg-farmgreen-50">
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>

                {requests.map((r) => (

                  <tr
                    key={r.id}
                    className="border-b last:border-none"
                  >

                    <td className="p-3 font-medium">
                      {r.equipment_name}
                    </td>

                    <td className="p-3">
                      {r.farmer_name}
                    </td>

                    <td className="p-3">
                      {new Date(
                        r.start_date
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        r.end_date
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColor[r.status]
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="p-3">

                      {r.status === "Pending" ? (

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              handleDecision(
                                r.id,
                                "approve"
                              )
                            }
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleDecision(
                                r.id,
                                "reject"
                              )
                            }
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full"
                          >
                            Reject
                          </button>

                        </div>

                      ) : (

                        <span className="text-gray-400 text-xs">
                          —
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}