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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.category ||
      !form.price_per_day ||
      !form.location
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!image) {
      setError("Equipment photo is compulsory.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("price_per_day", form.price_per_day);
      formData.append("location", form.location);
      formData.append("available", form.available);
      formData.append("image", image);

      await api.post("/equipment", formData);

      navigate("/owner-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not add equipment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="card">

        <h2 className="text-2xl font-bold text-farmgreen-700 mb-4">
          Add Equipment
        </h2>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="Equipment Name"
            className="input-field"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Category (e.g. Tractor, Harvester)"
            className="input-field"
            value={form.category}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            className="input-field"
            rows="3"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="price_per_day"
            type="number"
            min="0"
            placeholder="Price per day (₹)"
            className="input-field"
            value={form.price_per_day}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            className="input-field"
            value={form.location}
            onChange={handleChange}
            required
          />

          {/* REQUIRED IMAGE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Equipment Photo <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* IMAGE PREVIEW */}
          {preview && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">
                Photo Preview
              </p>

              <img
                src={preview}
                alt="Equipment preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
            />
            Available for rent
          </label>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Adding Equipment..." : "Add Equipment"}
          </button>

        </form>
      </div>
    </div>
  );
}