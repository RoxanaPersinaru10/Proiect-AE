const express = require("express");
const { Cart, Flight } = require("../database/models");
const { verifyToken } = require("../utils/tokenUtils");

const router = express.Router();


router.post("/add", verifyToken, async (req, res) => {
  try {
    console.log("POST /cart/add — cerere primită");
    console.log("    Body:", req.body);
    console.log("    userId din token:", req.userId);

    const userId = req.userId;
    const { flight_id, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token invalid sau utilizator lipsă.",
      });
    }

    if (!flight_id) {
      return res.status(400).json({
        success: false,
        message: "Lipsește flight_id din cerere.",
      });
    }

    const flightExists = await Flight.findByPk(flight_id);
    if (!flightExists) {
      return res.status(404).json({
        success: false,
        message: `Zborul cu ID ${flight_id} nu există în DB.`,
      });
    }

    const existing = await Cart.findOne({
      where: { user_id: userId, flight_id },
    });

    if (existing) {
      console.log(" Zbor deja în coș, actualizăm cantitatea...");
      existing.quantity += quantity || 1;
      await existing.save();
    } else {
      console.log(" Adăugăm zbor nou în coș...");
      await Cart.create({
        user_id: userId,
        flight_id,
        quantity: quantity || 1,
      });
    }

    res.json({ success: true, message: "Zbor adăugat în coș " });
  } catch (err) {
    console.error(" Eroare la /cart/add:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la adăugare în coș",
      error: err.message,
    });
  }
});


router.get("/", verifyToken, async (req, res) => {
  try {
    console.log(" GET /cart — userId:", req.userId);

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token invalid — utilizator neidentificat.",
      });
    }

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Flight,
          attributes: ["id", "from", "to", "airline", "price"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log(`🧾 ${cartItems.length} zbor(uri) găsit(e) în coș pentru user ${userId}`);

    res.json({
      success: true,
      message: "Coș încărcat cu succes ",
      data: cartItems,
    });
  } catch (err) {
    console.error(" Eroare la GET /cart:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la preluarea coșului",
      error: err.message,
    });
  }
});


router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    console.log(` PUT /cart/${id} — user ${userId}, noua cantitate: ${quantity}`);

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Cantitatea trebuie să fie cel puțin 1.",
      });
    }

    const cartItem = await Cart.findOne({ where: { id, user_id: userId } });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Articolul nu există în coș.",
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: "Cantitate actualizată cu succes ",
      data: cartItem,
    });
  } catch (err) {
    console.error(" Eroare la PUT /cart/:id:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la actualizarea cantității",
      error: err.message,
    });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await Cart.destroy({
      where: { id, user_id: userId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Articolul nu a fost găsit sau nu îți aparține.",
      });
    }

    res.json({
      success: true,
      message: "Zbor șters din coș ",
    });
  } catch (err) {
    console.error(" Eroare la DELETE /cart/:id:", err);
    res.status(500).json({
      success: false,
      message: "Eroare la ștergere din coș",
      error: err.message,
    });
  }
});

module.exports = router;
