import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:3000/auth/login"
      : "http://localhost:3000/auth/register";

    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (isLogin && data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          setMessage("Autentificare reușită ");
          navigate("/");
        } else {
          setMessage("Cont creat cu succes! Acum te poți autentifica.");
          setIsLogin(true);
        }
      } else {
        setMessage(data.message || "Eroare la autentificare.");
      }
    } catch (err) {
      console.error(" Eroare la trimiterea cererii:", err);
      setMessage("Eroare de rețea sau server indisponibil.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMessage("Te-ai delogat cu succes!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {isLogin ? "Autentificare" : "Înregistrare"}
        </h1>

        {!token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Nume"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {isLogin ? "Autentifică-te" : "Creează cont"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-600 mb-4">Ești autentificat </p>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}

        <p
          className="text-center mt-6 text-blue-700 cursor-pointer underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Nu ai cont? Creează unul nou"
            : "Ai deja cont? Autentifică-te"}
        </p>

        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
