import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=600&fit=crop";

export default function EquipmentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api
      .get(`/equipment/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setError("Equipment not found."));
  }, [id]);

  const handleRent = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after the start date.");
      return;
    }

    try {
      await api.post("/bookings", {
        equipment_id: Number(id),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });

      setMessage(
        "Rental request sent! Check your dashboard for status."
      );

      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not send rental request."
      );
    }
  };

  if (error && !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">😕</div>

        <p className="text-red-600 mb-5">
          {error}
        </p>

        <button
          onClick={() => navigate("/equipment")}
          className="btn-primary"
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🚜</div>

        <p className="text-gray-500">
          Loading equipment...
        </p>
      </div>
    );
  }

  const imageSrc = item.image_url
    ? `${API_URL}${item.image_url}`
    : PLACEHOLDER_IMAGE;

  // Owner cannot rent their own equipment.
  const isOwnEquipment =
    user &&
    Number(user.id) === Number(item.owner_id);

  const canRent =
    user &&
    !isOwnEquipment &&
    item.available;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-farmgreen-700 font-medium mb-5"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* IMAGE */}
            <div className="bg-gray-100 min-h-[320px] lg:min-h-[560px]">
              <img
                src={imageSrc}
                alt={item.name}
                className="w-full h-full min-h-[320px] lg:min-h-[560px] object-cover"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* DETAILS */}
            <div className="p-6 md:p-10 flex flex-col">

              {/* BASIC INFORMATION */}
              <div className="mb-6">

                <span className="inline-flex bg-green-50 text-farmgreen-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {item.category}
                </span>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {item.name}
                </h1>

                <p className="text-gray-500 mt-2">
                  📍 {item.location}
                </p>
              </div>

              {/* PRICE */}
              <div className="bg-farmgreen-50 rounded-2xl p-5 mb-6">
                <p className="text-sm text-gray-500">
                  Rental price
                </p>

                <p className="text-3xl font-extrabold text-farmgreen-700">
                  ₹{item.price_per_day}
                  <span className="text-base font-medium text-gray-500">
                    {" "}
                    / day
                  </span>
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Description
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {item.description ||
                    "No description provided for this equipment."}
                </p>
              </div>

              {/* LOGGED-OUT USER */}
              {!user && (
                <div className="border-t border-gray-100 pt-5 mb-6">
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-5">

                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      🔒 Rental Details
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      Login to view the equipment owner details
                      and rental options.
                    </p>

                    <button
                      className="btn-primary w-full py-3"
                      onClick={() => navigate("/login")}
                    >
                      Login to Continue
                    </button>

                  </div>
                </div>
              )}

              {/* MESSAGES */}
              {message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* OWNER DETAILS - ONLY LOGGED IN */}
              {user && (
                <>
                  <div className="border-t border-gray-100 pt-5 mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      Equipment Owner
                    </h3>

                    <div className="space-y-2 text-sm">

                      <p>
                        <span className="font-semibold text-gray-700">
                          Name:
                        </span>{" "}
                        {item.owner_name}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-700">
                          Phone:
                        </span>{" "}
                        {item.owner_phone}
                      </p>

                    </div>
                  </div>

                  {/* AVAILABILITY - ONLY LOGGED IN */}
                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${
                        item.available
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span>●</span>

                      {item.available
                        ? "Available for rent"
                        : "Currently unavailable"}
                    </span>
                  </div>

                  {/* OWN EQUIPMENT */}
                  {isOwnEquipment && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-4">
                      This is your equipment. You cannot rent your own equipment.
                    </div>
                  )}

                  {/* RENT */}
                  {canRent && (
                    <>
                      {!showForm ? (
                        <button
                          className="btn-primary w-full py-3 text-base"
                          onClick={() => setShowForm(true)}
                        >
                          Rent This Equipment
                        </button>
                      ) : (
                        <form
                          onSubmit={handleRent}
                          className="bg-gray-50 rounded-2xl p-5 space-y-4"
                        >
                          <h3 className="font-bold text-lg">
                            Select Rental Dates
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <div>
                              <label className="text-sm font-medium block mb-1">
                                Start Date
                              </label>

                              <input
                                type="date"
                                className="input-field"
                                value={startDate}
                                onChange={(e) =>
                                  setStartDate(e.target.value)
                                }
                                required
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">
                                End Date
                              </label>

                              <input
                                type="date"
                                className="input-field"
                                value={endDate}
                                onChange={(e) =>
                                  setEndDate(e.target.value)
                                }
                                required
                              />
                            </div>

                          </div>

                          <div className="flex gap-2">

                            <button
                              type="submit"
                              className="btn-primary flex-1"
                            >
                              Confirm Rental
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="px-5 py-2 rounded-lg border border-gray-200"
                            >
                              Cancel
                            </button>

                          </div>
                        </form>
                      )}
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
