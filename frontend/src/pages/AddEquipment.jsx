import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddEquipment() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price_per_day: "",
    location: "",
    available: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG, or WEBP image."
      );
      setImage(null);
      setPreview("");
      return;
    }

    setError("");
    setImage(file);

    const imagePreview = URL.createObjectURL(file);
    setPreview(imagePreview);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Required fields
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.price_per_day ||
      !form.location.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Image required
    if (!image) {
      setError("Equipment photo is compulsory.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "category",
        form.category.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "price_per_day",
        form.price_per_day
      );

      formData.append(
        "location",
        form.location.trim()
      );

      formData.append(
        "available",
        form.available
      );

      formData.append(
        "image",
        image
      );

      await api.post(
        "/equipment",
        formData
      );

      setSuccess(
        "Equipment listed successfully!"
      );

      // Return to the public equipment marketplace
      setTimeout(() => {
        navigate("/equipment");
      }, 1000);

    } catch (err) {
      console.error(
        "ADD EQUIPMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Could not add equipment. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
  <div
    className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-cover bg-center"
    style={{
      backgroundImage: "url('/farm-background.svg')",
    }}
  >
    {/* Light overlay */}
    <div className="absolute inset-0 bg-white/70"></div>

    <div className="relative z-10 w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          {/* HEADER */}

          <div className="mb-6">

            <h1 className="text-3xl font-bold text-green-700">
              List Your Equipment
            </h1>

            <p className="text-gray-500 mt-2">
              Add your agricultural equipment
              for other farmers to rent.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5">
              {success}
            </div>
          )}


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EQUIPMENT NAME */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipment Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Example: John Deere Tractor"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <input
                type="text"
                name="category"
                placeholder="Example: Tractor"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe your equipment..."
                rows="4"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>


            {/* PRICE */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rental Price Per Day
              </label>

              <div className="relative">

                <span className="absolute left-4 top-3 text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="price_per_day"
                  min="1"
                  placeholder="Price per day"
                  value={form.price_per_day}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

            </div>


            {/* LOCATION */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Example: Hyderabad"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>


            {/* IMAGE */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipment Photo
                <span className="text-red-500 ml-1">
                  *
                </span>
              </label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              />

              <p className="text-xs text-gray-500 mt-2">
                JPG, JPEG, PNG or WEBP only.
              </p>

            </div>


            {/* IMAGE PREVIEW */}

            {preview && (

              <div>

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Photo Preview
                </p>

                <img
                  src={preview}
                  alt="Equipment preview"
                  className="w-full h-64 object-cover rounded-xl border"
                />

              </div>

            )}


            {/* AVAILABLE */}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="w-5 h-5"
              />

              <span className="text-sm text-gray-700">
                Available for rent
              </span>

            </label>


            {/* BUTTONS */}

            <div className="flex gap-3 pt-3">

              <button
                type="button"
                onClick={() => navigate("/equipment")}
                className="w-1/3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >

                {loading
                  ? "Listing Equipment..."
                  : "List Equipment"
                }

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}