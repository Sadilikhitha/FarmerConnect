import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function OwnerDashboard() {
  const { user } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // LOAD ALL DASHBOARD DATA
  // =====================================================

  const loadData = async () => {
    setError("");

    try {
      const [
        equipmentResponse,
        myRequestsResponse,
        receivedRequestsResponse,
      ] = await Promise.all([
        api.get("/equipment/mine"),
        api.get("/bookings/my"),
        api.get("/bookings/owner"),
      ]);

      setEquipment(equipmentResponse.data);
      setMyRequests(myRequestsResponse.data);
      setReceivedRequests(receivedRequestsResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Could not load dashboard data."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =====================================================
  // TOGGLE EQUIPMENT AVAILABILITY
  // =====================================================

  const handleAvailability = async (item) => {
    clearMessages();

    setUpdatingId(item.id);

    try {
      const res = await api.put(
        `/equipment/${item.id}`,
        {
          available: !item.available,
        }
      );

      setEquipment((current) =>
        current.map((equipmentItem) =>
          equipmentItem.id === item.id
            ? res.data
            : equipmentItem
        )
      );

      setSuccess(
        `${item.name} is now ${
          res.data.available
            ? "available"
            : "unavailable"
        }.`
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

  // =====================================================
  // APPROVE / REJECT
  // =====================================================

  const handleDecision = async (id, action) => {
    clearMessages();

    setUpdatingId(id);

    try {
      await api.put(
        `/bookings/${id}/${action}`
      );

      setSuccess(
        action === "approve"
          ? "Rental request approved."
          : "Rental request rejected."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update the rental request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // CANCEL REQUEST / BOOKING
  // =====================================================

  const handleCancel = async (id) => {
    clearMessages();

    const confirmed = window.confirm(
      "Are you sure you want to cancel this rental request?"
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(id);

    try {
      await api.put(
        `/bookings/${id}/cancel`
      );

      setSuccess(
        "Rental request has been cancelled."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not cancel the rental request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        statusColor[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <p className="text-sm text-farmgreen-600 font-semibold">
            My Dashboard
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

      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mt-5">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-xl mt-5">
          {success}
        </div>
      )}

      {/* =================================================
          MY EQUIPMENT
      ================================================= */}

      <section className="mt-8">

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

          <div className="card text-center py-8">

            <div className="text-5xl mb-3">
              🚜
            </div>

            <p className="font-semibold text-gray-700">
              You haven't listed any equipment yet.
            </p>

            <Link
              to="/add-equipment"
              className="btn-primary inline-block mt-4"
            >
              + Add Equipment
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {equipment.map((item) => (

              <div
                key={item.id}
                className="card"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h4 className="text-lg font-bold text-gray-800">
                      {item.name}
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.category} · {item.location}
                    </p>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                <p className="text-lg font-bold text-farmgreen-600 mt-4">
                  ₹{item.price_per_day}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / day
                  </span>
                </p>

                <button
                  onClick={() =>
                    handleAvailability(item)
                  }
                  disabled={
                    updatingId === item.id
                  }
                  className={`w-full mt-4 py-2.5 rounded-xl font-semibold ${
                    item.available
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
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

      </section>

      {/* =================================================
          REQUESTS I MADE
      ================================================= */}

      <section className="mt-10">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h3 className="text-xl font-bold text-farmgreen-700">
              My Rental Requests
            </h3>

            <p className="text-sm text-gray-500">
              Equipment you requested from other users.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {myRequests.length} request
            {myRequests.length !== 1 ? "s" : ""}
          </span>

        </div>

        {myRequests.length === 0 ? (

          <div className="card">
            <p className="text-gray-500">
              You haven't requested any equipment yet.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto rounded-2xl shadow-sm">

            <table className="w-full bg-white text-sm">

              <thead>

                <tr className="text-left border-b bg-farmgreen-50">

                  <th className="p-3">
                    Equipment
                  </th>

                  <th className="p-3">
                    Dates
                  </th>

                  <th className="p-3">
                    Total Price
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {myRequests.map((r) => (

                  <tr
                    key={r.id}
                    className="border-b last:border-none"
                  >

                    <td className="p-3 font-medium">
                      {r.equipment_name}
                    </td>

                    <td className="p-3">

                      {new Date(
                        r.start_date
                      ).toLocaleDateString()}

                      {" - "}

                      {new Date(
                        r.end_date
                      ).toLocaleDateString()}

                    </td>

                    <td className="p-3">
                      ₹{r.total_price}
                    </td>

                    <td className="p-3">
                      <StatusBadge
                        status={r.status}
                      />
                    </td>

                    <td className="p-3">

                      {(r.status === "Pending" ||
                        r.status === "Approved") && (

                        <button
                          onClick={() =>
                            handleCancel(r.id)
                          }
                          disabled={
                            updatingId === r.id
                          }
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full font-semibold"
                        >
                          {updatingId === r.id
                            ? "Cancelling..."
                            : r.status === "Approved"
                            ? "Cancel Booking"
                            : "Cancel Request"}
                        </button>

                      )}

                      {r.status === "Cancelled" && (
                        <span className="text-gray-400 text-xs">
                          Cancelled
                        </span>
                      )}

                      {r.status === "Rejected" && (
                        <span className="text-gray-400 text-xs">
                          Rejected
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

      {/* =================================================
          REQUESTS RECEIVED
      ================================================= */}

      <section className="mt-10">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h3 className="text-xl font-bold text-farmgreen-700">
              Rental Requests Received
            </h3>

            <p className="text-sm text-gray-500">
              People requesting your equipment.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {receivedRequests.length} request
            {receivedRequests.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {receivedRequests.length === 0 ? (

          <div className="card">
            <p className="text-gray-500">
              No rental requests received yet.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto rounded-2xl shadow-sm">

            <table className="w-full bg-white text-sm">

              <thead>

                <tr className="text-left border-b bg-farmgreen-50">

                  <th className="p-3">
                    Equipment
                  </th>

                  <th className="p-3">
                    Requested By
                  </th>

                  <th className="p-3">
                    Dates
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {receivedRequests.map((r) => (

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
                      ).toLocaleDateString()}

                      {" - "}

                      {new Date(
                        r.end_date
                      ).toLocaleDateString()}

                    </td>

                    <td className="p-3">
                      <StatusBadge
                        status={r.status}
                      />
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
                            disabled={
                              updatingId === r.id
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
                            disabled={
                              updatingId === r.id
                            }
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full"
                          >
                            Reject
                          </button>

                        </div>

                      ) : null}

                      {(r.status === "Pending" ||
                        r.status === "Approved") && (

                        <button
                          onClick={() =>
                            handleCancel(r.id)
                          }
                          disabled={
                            updatingId === r.id
                          }
                          className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full"
                        >
                          {updatingId === r.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>

                      )}

                      {r.status === "Rejected" && (
                        <span className="text-gray-400 text-xs">
                          Rejected
                        </span>
                      )}

                      {r.status === "Cancelled" && (
                        <span className="text-gray-400 text-xs">
                          Cancelled
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

      {/* =================================================
          UPDATES
      ================================================= */}

      <section className="mt-10">

        <h3 className="text-xl font-bold text-farmgreen-700 mb-4">
          🔔 Recent Updates
        </h3>

        <div className="space-y-3">

          {myRequests
            .filter(
              (r) =>
                r.status === "Approved" ||
                r.status === "Rejected" ||
                r.status === "Cancelled"
            )
            .slice(0, 5)
            .map((r) => (

              <div
                key={`update-${r.id}`}
                className={`p-4 rounded-xl ${
                  r.status === "Approved"
                    ? "bg-green-50 text-green-700"
                    : r.status === "Rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >

                {r.status === "Approved" && (
                  <>
                    🟢 Your request for{" "}
                    <strong>
                      {r.equipment_name}
                    </strong>{" "}
                    was approved.
                  </>
                )}

                {r.status === "Rejected" && (
                  <>
                    🔴 Your request for{" "}
                    <strong>
                      {r.equipment_name}
                    </strong>{" "}
                    was rejected.
                  </>
                )}

                {r.status === "Cancelled" && (
                  <>
                    ⚪ Your request for{" "}
                    <strong>
                      {r.equipment_name}
                    </strong>{" "}
                    was cancelled.
                  </>
                )}

              </div>

            ))}

          {myRequests.filter(
            (r) =>
              r.status === "Approved" ||
              r.status === "Rejected" ||
              r.status === "Cancelled"
          ).length === 0 && (

            <div className="card">
              <p className="text-gray-500">
                No updates yet.
              </p>
            </div>

          )}

        </div>

      </section>

    </div>
  );
}