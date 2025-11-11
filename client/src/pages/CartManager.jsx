import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CartManager() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const API_URL = "http://localhost:3000/cart";

  // Preia coșul utilizatorului
  const getCart = async () => {
    if (!token) {
      setMessage("Trebuie să fii autentificat pentru a-ți vedea coșul ");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setCart(data.data);
        setMessage("Coș încărcat ");
      } else {
        setCart([]);
        setMessage(data.message || "Coșul este gol ");
      }
    } catch (err) {
      console.error(" Eroare la preluarea coșului:", err);
      setMessage("Eroare de rețea la încărcare coș");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateQuantity = async (id, quantity) => {
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
        setMessage("Cantitate actualizată ");
        getCart();
      } else {
        setMessage(data.message || "Eroare la actualizare ");
      }
    } catch (err) {
      console.error("Eroare la actualizare cantitate:", err);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest zbor din coș?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Zbor șters din coș ");
        getCart();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(" Eroare la ștergere din coș:", err);
    }
  };

  // Plasează comanda
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Coșul este gol!");

    try {
      const items = cart.map((item) => ({
        flight_id: item.flight_id || item.Flight?.id,
        quantity: item.quantity,
      }));

      const res = await fetch("http://localhost:3000/bookings/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Comanda a fost plasată cu succes!");
        setMessage("Comandă plasată ✅");
        setCart([]);
        setOrderPlaced(true); // activăm butonul de navigare către BookingManager
      } else {
        alert( (data.message || "Eroare la plasarea comenzii"));
      }
    } catch (err) {
      console.error(" Eroare la plasarea comenzii:", err);
      alert("Eroare la plasarea comenzii");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-yellow-700 mb-6">
        🛒 Coșul meu
      </h1>

      {message && (
        <p className="text-center text-gray-700 mb-6 font-semibold">{message}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Se încarcă coșul...</p>
      ) : (
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Zboruri adăugate în coș
          </h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border p-2">ID</th>
                <th className="border p-2">De la</th>
                <th className="border p-2">Către</th>
                <th className="border p-2">Companie</th>
                <th className="border p-2">Preț</th>
                <th className="border p-2">Cantitate</th>
                <th className="border p-2">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="border p-2">{item.id}</td>
                    <td className="border p-2">{item.Flight?.from}</td>
                    <td className="border p-2">{item.Flight?.to}</td>
                    <td className="border p-2">{item.Flight?.airline}</td>
                    <td className="border p-2">{item.Flight?.price}$</td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newCart = cart.map((c) =>
                            c.id === item.id
                              ? { ...c, quantity: parseInt(e.target.value) }
                              : c
                          );
                          setCart(newCart);
                        }}
                        className="w-16 border rounded px-2 text-center"
                      />
                    </td>
                    <td className="border p-2 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                         Actualizează
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Șterge
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-3 text-gray-500">
                    Coșul tău este gol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/*  Butoane finale */}
          <div className="text-center mt-6 flex flex-col gap-3 items-center">
            {cart.length > 0 && (
              <button
                onClick={placeOrder}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                 Plasează comanda
              </button>
            )}

            {orderPlaced && (
              <button
                onClick={() => navigate("/bookings")}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold"
              >
                 Mergi la comenzile mele
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartManager;
