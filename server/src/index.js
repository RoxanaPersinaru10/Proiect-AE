// src/index.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const sequelize = require("./database/server");

// Importă modelele (toate, nu doar User)
const { User, Flight, Booking, Cart } = require("./database/models");

// Importă rutele
const flightRoutes = require("./routes/flight.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const cartRoutes = require("./routes/cart.routes");
const bookingRoutes = require("./routes/booking.routes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware-uri
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Rute API
app.use("/flights", flightRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/bookings", bookingRoutes);

// Endpoint simplu pentru testare DB
app.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      message: "Baza de date funcționează! ✅",
      totalUsers: users.length,
      users,
    });
  } catch (err) {
    console.error("❌ Eroare la testul DB:", err);
    res.status(500).json({ message: "Eroare DB", error: err.message });
  }
});

// Pornește serverul + sincronizează modelele
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectare la baza de date reușită.");
    await sequelize.sync(); // poți adăuga { alter: true } dacă vrei să ajusteze automat tabelele
    console.log("✅ Models synced successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server successfully started on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Eroare la pornirea serverului:", err);
  }
})();
