import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import EquipmentCard from "../components/EquipmentCard";

export default function Equipment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const fetchEquipment = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (location) params.location = location;

      const res = await api.get("/equipment", { params });
      setItems(res.data);
    } catch (err) {
      setError("Could not load equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchEquipment();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-farmgreen-700 mb-4">
        Available Equipment
      </h2>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-xl shadow-sm"
      >
        <input
          className="input-field flex-1 min-w-[150px]"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="input-field flex-1 min-w-[150px]"
          placeholder="Category (e.g. Tractor)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className="input-field flex-1 min-w-[150px]"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading equipment...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No equipment matches your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
