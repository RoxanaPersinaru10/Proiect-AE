import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:3000/auth/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Eroare la verificarea userului:", err);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  const loggedIn = !!token && !!user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <h1 className="text-4xl font-bold mb-10 text-blue-800 text-center">
        ✈️ Bine ai venit în aplicația de zboruri!
      </h1>

      <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center">
        {/* 🔹 Vizibil tuturor */}
        <button
          onClick={() => navigate("/flights")}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
        >
          🔍 Caută zboruri
        </button>

        {/* 🔹 Dacă nu e logat */}
        {!loggedIn ? (
          <button
            onClick={() => navigate("/auth")}
            className="bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 transition-all shadow-md"
          >
            🔑 Autentificare
          </button>
        ) : (
          <>
            {/* 🔹 Dacă e admin */}
            {user?.role === "admin" ? (
              <>
                <button
                  onClick={() => navigate("/users")}
                  className="bg-indigo-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-600 transition-all shadow-md"
                >
                  👥 Operații CRUD Utilizatori
                </button>

                <button
                  onClick={() => navigate("/flights-manager")}
                  className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-600 transition-all shadow-md"
                >
                  ✈️ Operații CRUD Zboruri
                </button>
              </>
            ) : (
              <>
                {/* 🔹 Dacă e utilizator normal */}
                <button
                  onClick={() => navigate("/cart")}
                  className="bg-yellow-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-yellow-600 transition-all shadow-md"
                >
                  🛒 Coșul meu
                </button>

                <button
                  onClick={() => navigate("/bookings")}
                  className="bg-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-600 transition-all shadow-md"
                >
                  📦 Comenzile mele
                </button>
              </>
            )}

            {/* 🔴 Logout comun pentru toți */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-red-600 transition-all shadow-md"
            >
              🔒 Logout
            </button>
          </>
        )}
      </div>

      <p className="mt-10 text-gray-600 text-center max-w-lg">
        Poți căuta liber zboruri fără autentificare.  
        Dacă vrei să gestionezi utilizatori sau zboruri, intră ca admin.  
        Dacă ești client, poți accesa coșul și comenzile tale.
      </p>
    </div>
  );
}

export default Homepage;
