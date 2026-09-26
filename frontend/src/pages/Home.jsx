import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=900&h=700&fit=crop";

export default function Home() {
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/equipment")
      .then((res) => setEquipment(res.data))
      .catch(() => setEquipment([]));
  }, []);

  // Group equipment by category
  const categories = Object.values(
    equipment.reduce((groups, item) => {
      const categoryName = item.category?.trim() || "Other";
      const key = categoryName.toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          name: categoryName,
          items: [],
        };
      }

      groups[key].items.push(item);

      return groups;
    }, {})
  );

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      navigate("/equipment");
      return;
    }

    navigate(
      `/equipment?search=${encodeURIComponent(searchTerm.trim())}`
    );
  };

  return (
    <div className="min-h-screen bg-[#f7faf6]">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-[650px] overflow-hidden bg-gradient-to-br from-[#0b3d2e] via-[#176b45] to-[#4f8f3a]">

        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-green-300/20 rounded-full blur-3xl" />

        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-yellow-300/10 rounded-full blur-3xl" />

        {/* Floating farming items */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute top-[12%] left-[7%] text-6xl opacity-20 rotate-[-12deg]">
            🚜
          </div>

          <div className="absolute top-[18%] right-[9%] text-7xl opacity-20 rotate-[10deg]">
            🌾
          </div>

          <div className="absolute bottom-[18%] left-[12%] text-6xl opacity-15 rotate-[8deg]">
            🌱
          </div>

          <div className="absolute bottom-[12%] right-[14%] text-6xl opacity-20 rotate-[-8deg]">
            🚜
          </div>

          <div className="absolute top-[45%] left-[3%] text-5xl opacity-10">
            🔧
          </div>

          <div className="absolute top-[55%] right-[3%] text-5xl opacity-10">
            💧
          </div>

          <div className="absolute top-[8%] left-[45%] text-4xl opacity-10">
            🌱
          </div>

          <div className="absolute bottom-[5%] left-[45%] text-5xl opacity-10">
            🌾
          </div>

          {/* Soft grid */}
          <div className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">

          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-green-50 text-sm font-medium mb-7">
              <span>🌾</span>
              <span>India's Agricultural Equipment Marketplace</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Grow More.
              <br />
              <span className="text-green-200">
                Rent Smarter.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto mt-7 text-lg md:text-xl text-green-50/90 leading-relaxed">
              Find tractors, harvesters, cultivators and farming tools
              from equipment owners near you — or list your own equipment
              and earn from it.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto mt-10"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">

                <div className="flex-1 flex items-center px-4">
                  <span className="text-xl mr-3">🔍</span>

                  <input
                    type="text"
                    placeholder="Search tractors, harvesters, tools..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="w-full py-4 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#176b45] hover:bg-[#0f5738] text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-md"
                >
                  Search Equipment
                </button>
              </div>
            </form>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-7">

              <button
                onClick={() => navigate("/equipment")}
                className="px-7 py-3.5 rounded-xl bg-white text-[#176b45] font-bold hover:bg-green-50 transition-all shadow-lg"
              >
                🚜 Find Equipment
              </button>

              <button
                onClick={() => navigate("/add-equipment")}
                className="px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur text-white font-bold hover:bg-white/20 transition-all"
              >
                + List Your Equipment
              </button>

            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#f7faf6] rounded-t-[50%] scale-x-110 translate-y-10" />

      </section>

      {/* =====================================================
          QUICK CATEGORY STRIP
      ====================================================== */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 -mt-4">

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-7">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {[
              { icon: "🚜", title: "Tractors" },
              { icon: "🌾", title: "Harvesters" },
              { icon: "🌱", title: "Cultivators" },
              { icon: "🔧", title: "Farm Tools" },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() =>
                  navigate(
                    `/equipment?category=${encodeURIComponent(
                      item.title
                    )}`
                  )
                }
                className="group flex items-center gap-3 p-4 rounded-2xl hover:bg-green-50 transition-all text-left"
              >
                <span className="w-12 h-12 rounded-xl bg-green-50 group-hover:bg-white flex items-center justify-center text-2xl transition">
                  {item.icon}
                </span>

                <div>
                  <p className="font-bold text-gray-800">
                    {item.title}
                  </p>

                  <p className="text-xs text-gray-500">
                    Explore →
                  </p>
                </div>
              </button>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY SECTION
      ====================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#4f8f3a]">
              Explore Marketplace
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              What are you looking for?
            </h2>

            <p className="text-gray-500 mt-3">
              Browse equipment by category.
            </p>
          </div>

          <button
            onClick={() => navigate("/equipment")}
            className="mt-4 md:mt-0 text-[#176b45] font-bold hover:underline"
          >
            View All Equipment →
          </button>

        </div>

        {categories.length === 0 ? (

          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">

            <div className="text-6xl mb-5">
              🚜
            </div>

            <h3 className="text-2xl font-bold text-gray-800">
              No equipment listed yet
            </h3>

            <p className="text-gray-500 mt-2 mb-6">
              Be the first to list your farming equipment.
            </p>

            <button
              onClick={() => navigate("/add-equipment")}
              className="btn-primary"
            >
              + List Equipment
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {categories.map((group) => {

              const availableCount = group.items.filter(
                (item) => item.available
              ).length;

              const startingPrice = Math.min(
                ...group.items.map(
                  (item) => Number(item.price_per_day)
                )
              );

              const categoryImage =
                group.items.find(
                  (item) => item.image_url
                )?.image_url;

              const imageSrc = categoryImage
                ? `${API_URL}${categoryImage}`
                : PLACEHOLDER_IMAGE;

              return (
                <div
                  key={group.name}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >

                  {/* IMAGE */}
                  <div className="relative h-60 overflow-hidden">

                    <img
                      src={imageSrc}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute bottom-5 left-5">
                      <p className="text-white/80 text-sm">
                        {group.items.length} listed
                      </p>

                      <h3 className="text-2xl font-black text-white">
                        {group.name}
                      </h3>
                    </div>

                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-xs font-bold text-[#176b45]">
                      {availableCount} available
                    </div>

                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-6">

                    <div className="flex justify-between items-center mb-6">

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">
                          Available
                        </p>

                        <p className="text-xl font-black text-gray-900">
                          {availableCount}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-semibold">
                          Starting at
                        </p>

                        <p className="text-xl font-black text-[#176b45]">
                          ₹{startingPrice}
                          <span className="text-xs font-medium text-gray-400">
                            {" "}
                            /day
                          </span>
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/equipment?category=${encodeURIComponent(
                            group.name
                          )}`
                        )
                      }
                      className="w-full bg-[#176b45] hover:bg-[#0f5738] text-white font-bold py-3.5 rounded-xl transition-all"
                    >
                      View {group.name} →
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section className="bg-[#103c2d] text-white py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">

            <p className="text-green-300 text-sm font-bold uppercase tracking-widest">
              Simple & Easy
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              How FarmerConnect Works
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {[
              {
                number: "01",
                icon: "🔎",
                title: "Find Equipment",
                text: "Search by equipment, category or location and find what your farm needs.",
              },
              {
                number: "02",
                icon: "📋",
                title: "Choose a Listing",
                text: "Compare photos, prices, locations, availability and owner information.",
              },
              {
                number: "03",
                icon: "🤝",
                title: "Rent & Get Farming",
                text: "Send a rental request and connect with the equipment owner.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition"
              >

                <span className="absolute top-5 right-6 text-4xl font-black text-white/10">
                  {step.number}
                </span>

                <div className="text-4xl mb-5">
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {step.title}
                </h3>

                <p className="text-green-100/70 leading-relaxed">
                  {step.text}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">

        <div className="max-w-4xl mx-auto text-center px-4">

          <div className="text-5xl mb-5">
            🌾
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-900">
            Have equipment sitting idle?
          </h2>

          <p className="text-gray-500 text-lg mt-4 mb-8">
            List it on FarmerConnect and make it useful for another farmer.
          </p>

          <button
            onClick={() => navigate("/add-equipment")}
            className="bg-[#176b45] hover:bg-[#0f5738] text-white font-bold px-9 py-4 rounded-xl shadow-lg transition-all"
          >
            + List Your Equipment
          </button>

        </div>
      </section>

    </div>
  );
}