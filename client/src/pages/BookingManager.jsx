import React, { useEffect, useState } from "react";

function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("toate");
  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:3000/bookings";

  // 🔹 Preia comenzile utilizatorului autentificat
  const getBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
        setMessage("Comenzi încărcate ✅");
      } else {
        setBookings([]);
        setMessage(data.message || "Nu s-au găsit comenzi ❌");
      }
    } catch (err) {
      console.error("❌ Eroare la preluarea comenzilor:", err);
      setMessage("Eroare la încărcarea comenzilor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getBookings();
  }, [token]);

  // ✏️ Actualizează cantitatea unei comenzi
  const updateBooking = async (id, quantity) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Cantitate actualizată ✅");
        getBookings();
      } else {
        setMessage(data.message || "Eroare la actualizare ❌");
      }
    } catch (err) {
      console.error("❌ Eroare la actualizare comandă:", err);
      setMessage("Eroare de rețea la actualizare.");
    }
  };

  // 🟠 Anulează o comandă (schimbă statusul în "anulată")
  const cancelBooking = async (id) => {
    if (!window.confirm("Sigur vrei să anulezi această comandă?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "anulată" }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Comanda a fost anulată ❌");
        getBookings();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error("❌ Eroare la anularea comenzii:", err);
      setMessage("Eroare la anulare comandă.");
    }
  };

  // 🔍 Filtrare după status
  const filteredBookings =
    filter === "toate"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        📦 Comenzile mele
      </h1>

      {message && (
        <p className="text-center text-gray-700 mb-6 font-semibold">{message}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Se încarcă comenzile...</p>
      ) : (
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md">
          {/* 🔹 Filtru status */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Lista comenzilor
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="toate">🔄 Toate comenzile</option>
              <option value="plasată">🟢 Active (plasate)</option>
              <option value="anulată">🔴 Anulate</option>
            </select>
          </div>

          {filteredBookings.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border p-2">De la</th>
                  <th className="border p-2">Către</th>
                  <th className="border p-2">Companie</th>
                  <th className="border p-2">Preț</th>
                  <th className="border p-2">Cantitate</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-100">
                    <td className="border p-2">{b.Flight?.from || "-"}</td>
                    <td className="border p-2">{b.Flight?.to || "-"}</td>
                    <td className="border p-2">{b.Flight?.airline || "-"}</td>
                    <td className="border p-2">{b.Flight?.price || "-"}$</td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={b.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          const updated = bookings.map((bk) =>
                            bk.id === b.id ? { ...bk, quantity: newQuantity } : bk
                          );
                          setBookings(updated);
                        }}
                        className="w-16 border rounded px-2 text-center"
                        disabled={b.status === "anulată"}
                      />
                    </td>
                    <td
                      className={`border p-2 font-semibold ${
                        b.status === "anulată"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {b.status}
                    </td>
                    <td className="border p-2 text-center flex gap-2 justify-center">
                      {b.status !== "anulată" && (
                        <>
                          <button
                            onClick={() => updateBooking(b.id, b.quantity)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            💾 Salvează
                          </button>
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            🚫 Anulează
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 mt-6">
              Nu există comenzi {filter === "anulată" ? "anulate" : "active"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingManager;
