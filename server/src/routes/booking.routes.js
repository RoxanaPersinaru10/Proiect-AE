// server/src/routes/booking.routes.js
const express = require("express");
const { Booking, Flight } = require("../database/models");
const { verifyToken } = require("../utils/tokenUtils");

const router = express.Router();

/**
 * 🟢 POST /bookings/place — Plasează o comandă pentru utilizatorul autentificat
 */
router.post("/place", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body; // [{ flight_id, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lista de zboruri este goală.",
      });
    }

    const bookings = [];

    for (const item of items) {
      const { flight_id, quantity } = item;

      const flight = await Flight.findByPk(flight_id);
      if (!flight) continue;

      const booking = await Booking.create({
        user_id: userId,
        flight_id,
        quantity: quantity || 1,
        status: "plasată",
      });

      bookings.push(booking);
    }

    res.json({
      success: true,
      message: "Comandă plasată cu succes ✅",
      data: bookings,
    });
  } catch (err) {
    console.error("❌ Eroare la POST /bookings/place:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la plasarea comenzii",
      error: err.message,
    });
  }
});

/**
 * 🟣 GET /bookings — Returnează comenzile utilizatorului logat
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Flight,
          attributes: ["from", "to", "airline", "price"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      message: "Comenzi găsite ✅",
      data: orders,
    });
  } catch (err) {
    console.error("❌ Eroare la GET /bookings:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la preluarea comenzilor",
      error: err.message,
    });
  }
});

module.exports = router;
