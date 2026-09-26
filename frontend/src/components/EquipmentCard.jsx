import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=300&fit=crop";

export default function EquipmentCard({ item }) {
  const imageSrc = item.image_url
    ? `${API_URL}${item.image_url}`
    : PLACEHOLDER_IMAGE;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />

        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
            item.available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {item.available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">

        <p className="text-xs font-semibold uppercase tracking-wide text-farmgreen-600">
          {item.category}
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-1">
          {item.name}
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          📍 {item.location}
        </p>

        <div className="mt-4 mb-4">
          <span className="text-xl font-extrabold text-farmgreen-700">
            ₹{item.price_per_day}
          </span>

          <span className="text-sm text-gray-500">
            {" "}
            / day
          </span>
        </div>

        <Link
          to={`/equipment/${item.id}`}
          className="btn-primary text-center mt-auto w-full"
        >
          View Details →
        </Link>

      </div>
    </div>
  );
}