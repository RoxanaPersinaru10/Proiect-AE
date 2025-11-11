import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setUserName(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/check", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success && data.user) {
          setUserName(data.user.name);
        } else {
          localStorage.removeItem("token");
          setUserName(null);
        }
      } catch (err) {
        console.error("Eroare la verificarea utilizatorului:", err);
        localStorage.removeItem("token");
        setUserName(null);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserName(null);
    navigate("/auth");
  };

  return (
    <nav className="bg-blue-700 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/"> Home</Link>
      </div>

      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <Link to="/users" className="hover:underline">
              Utilizatori
            </Link>
            <Link to="/cart" className="hover:underline">
              Coș
            </Link>
            {userName ? (
              <span className="font-semibold text-yellow-300">
                {userName}
              </span>
            ) : (
              <span className="italic text-gray-300">Se încarcă...</span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="hover:underline">
            Autentificare
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
