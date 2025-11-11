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

    // 🧹 După ce comenzile au fost create, golim coșul utilizatorului
    const { Cart } = require("../database/models");
    const deletedCount = await Cart.destroy({ where: { user_id: userId } });
    console.log(`🧹 Coș golit automat — ${deletedCount} articole șterse.`);

    res.json({
      success: true,
      message: `Comandă plasată cu succes ✅ (coșul a fost golit automat)`,
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

/**
 * ✏️ PUT /bookings/:id — Actualizează cantitatea unei comenzi
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { quantity, status } = req.body;

    const booking = await Booking.findOne({
      where: { id, user_id: userId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Comanda nu a fost găsită sau nu îți aparține.",
      });
    }

    if (quantity) booking.quantity = quantity;
    if (status) booking.status = status;

    await booking.save();

    res.json({
      success: true,
      message: "Comanda actualizată cu succes ✅",
      data: booking,
    });
  } catch (err) {
    console.error("❌ Eroare la PUT /bookings/:id:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la actualizarea comenzii",
      error: err.message,
    });
  }
});

/**
 * ❌ DELETE /bookings/:id — Șterge complet o comandă
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({
      where: { id, user_id: userId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Comanda nu a fost găsită sau nu îți aparține.",
      });
    }

    await booking.destroy();

    res.json({
      success: true,
      message: "Comanda a fost ștearsă complet ❌",
    });
  } catch (err) {
    console.error("❌ Eroare la DELETE /bookings/:id:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la ștergerea comenzii",
      error: err.message,
    });
  }
});

module.exports = router;
