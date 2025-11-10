import React, { useEffect, useState } from "react";

function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getBookings = async () => {
      const res = await fetch("http://localhost:3000/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBookings(data.data);
    };
    getBookings();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        📦 Comenzile mele
      </h1>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        {bookings.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border p-2">De la</th>
                <th className="border p-2">Către</th>
                <th className="border p-2">Companie</th>
                <th className="border p-2">Preț</th>
                <th className="border p-2">Cantitate</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-100">
                  <td className="border p-2">{b.Flight?.from}</td>
                  <td className="border p-2">{b.Flight?.to}</td>
                  <td className="border p-2">{b.Flight?.airline}</td>
                  <td className="border p-2">{b.Flight?.price}$</td>
                  <td className="border p-2">{b.quantity}</td>
                  <td className="border p-2 text-green-600 font-semibold">
                    {b.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">
            Nu ai comenzi plasate încă.
          </p>
        )}
      </div>
    </div>
  );
}

export default BookingManager;
