const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const { Flight } = require("../database/models");

dotenv.config();
const router = express.Router();

/**
 * 🟢 GET /flights/fetch
 * Primește parametri dinamici (from, to, depart, return) din frontend
 * Apelează API-ul real și salvează maximum 20 de zboruri (unice) în baza de date.
 */
router.get("/fetch", async (req, res) => {
  try {
    console.log("🚀 Cerere nouă la /flights/fetch:", new Date().toISOString());

    const { from, to, depart, ret, adults } = req.query;

    if (!from || !to || !depart || !ret) {
      return res.status(400).json({
        success: false,
        message: "Parametrii lipsă. Trimite from, to, depart, ret.",
      });
    }

    const options = {
      method: "GET",
      url: "https://flights-sky.p.rapidapi.com/flights/search-roundtrip",
      params: {
        fromEntityId: from,
        toEntityId: to,
        departDate: depart,
        returnDate: ret,
        adults: adults || "1",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": process.env.RAPID_API_HOST,
      },
    };

    // 📡 Cerere către API extern
    const response = await axios.request(options);

    const itineraries = response.data?.data?.itineraries || [];
    if (!itineraries.length) {
      return res.status(404).json({
        success: false,
        message: "Nu s-au găsit zboruri.",
      });
    }

    // 🔹 Extragem zborurile dus + întors
    const flightsData = itineraries.map((it) => {
      const legGo = it.legs?.[0];
      const legReturn = it.legs?.[1];

      return {
        from: legGo?.origin?.name || "Necunoscut",
        to: legGo?.destination?.name || "Necunoscut",
        departDate: legGo?.departure,
        returnDate: legReturn?.departure || null,
        airline: legGo?.carriers?.marketing?.[0]?.name || "Companie necunoscută",
        airlineReturn: legReturn?.carriers?.marketing?.[0]?.name || "Companie necunoscută",
        price: it.price?.raw || 0,
      };
    });

    // 🔹 Eliminăm duplicatele (dus + întors identice)
    const uniqueFlights = [];
    const seen = new Set();

    for (const f of flightsData) {
      const key = `${f.from}-${f.to}-${f.departDate}-${f.returnDate}-${f.airline}-${f.airlineReturn}-${f.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFlights.push(f);
      }
    }

    // 🔹 Sortăm după preț și limităm la primele 20 zboruri
    const limitedFlights = uniqueFlights
      .sort((a, b) => a.price - b.price)
      .slice(0, 20);

    // 💾 Salvăm în baza de date și returnăm `id`-ul real pentru fiecare zbor
    let addedCount = 0;

    for (const f of limitedFlights) {
      const exists = await Flight.findOne({
        where: {
          from: f.from,
          to: f.to,
          date: f.departDate,
          return_date: f.returnDate,
          airline: f.airline,
          airline_return: f.airlineReturn,
          price: f.price,
        },
      });

      if (!exists) {
        const newFlight = await Flight.create({
          from: f.from,
          to: f.to,
          date: f.departDate,
          return_date: f.returnDate,
          airline: f.airline,
          airline_return: f.airlineReturn,
          price: f.price,
        });
        f.id = newFlight.id; // ✅ ID-ul nou creat
        addedCount++;
      } else {
        f.id = exists.id; // ✅ ID-ul existent (dacă zborul era deja salvat)
      }
    }

    res.status(200).json({
      success: true,
      message: `Am găsit ${limitedFlights.length} zboruri (max 20 unice), dintre care ${addedCount} noi au fost adăugate.`,
      data: limitedFlights,
    });
  } catch (error) {
    console.error("❌ Eroare API:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Eroare la preluarea zborurilor din API.",
      error: error.response?.data || error.message,
    });
  }
});

/**
 * 🟣 GET /flights/all
 * Returnează toate zborurile salvate în baza de date locală
 */
router.get("/all", async (req, res) => {
  try {
    const flights = await Flight.findAll({ order: [["created_at", "DESC"]] });

    if (!flights.length) {
      return res.status(404).json({
        success: false,
        message: "Nu există zboruri salvate în baza de date.",
      });
    }

    res.status(200).json({
      success: true,
      total: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("❌ Eroare la citirea zborurilor:", error.message);
    res.status(500).json({
      success: false,
      message: "Eroare la citirea zborurilor din baza de date.",
      error: error.message,
    });
  }
});

/**
 * 🟢 GET /flights/html
 * Afișează zborurile salvate în format tabelar HTML
 */
router.get("/html", async (req, res) => {
  try {
    const flights = await Flight.findAll({ order: [["created_at", "DESC"]] });

    if (!flights.length) {
      return res.send("<h2>Nu există zboruri salvate în baza de date.</h2>");
    }

    const rows = flights
      .map(
        (f) => `
        <tr>
          <td>${f.id}</td>
          <td>${f.from}</td>
          <td>${f.to}</td>
          <td>${new Date(f.date).toLocaleString()}</td>
          <td>${f.return_date ? new Date(f.return_date).toLocaleString() : "-"}</td>
          <td>${f.airline}</td>
          <td>${f.airline_return}</td>
          <td>${f.price}$</td>
        </tr>`
      )
      .join("");

    res.send(`
      <html>
        <head>
          <title>Zboruri salvate</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Zboruri salvate în baza de date</h2>
          <table>
            <tr>
              <th>ID</th><th>From</th><th>To</th><th>Depart Date</th><th>Return Date</th><th>Airline</th><th>Airline Return</th><th>Price</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("<h3>Eroare la afișarea datelor.</h3>");
  }
});
/**
 * 🟢 POST /flights — Creează un zbor nou în baza de date
 */
router.post("/", async (req, res) => {
  try {
    const { from, to, date, return_date, airline, airline_return, price } = req.body;

    if (!from || !to || !date || !airline || !price) {
      return res.status(400).json({
        success: false,
        message: "Câmpuri obligatorii lipsă (from, to, date, airline, price).",
      });
    }

    const newFlight = await Flight.create({
      from,
      to,
      date,
      return_date: return_date || null,
      airline,
      airline_return: airline_return || null,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Zbor adăugat cu succes ✈️",
      data: newFlight,
    });
  } catch (error) {
    console.error("❌ Eroare la POST /flights:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la adăugarea zborului.",
      error: error.message,
    });
  }
});

/**
 * 🟣 PUT /flights/:id — Actualizează un zbor existent
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const flight = await Flight.findByPk(id);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Zborul cu ID ${id} nu există.`,
      });
    }

    await flight.update(updates);

    res.json({
      success: true,
      message: "Zbor actualizat cu succes ✅",
      data: flight,
    });
  } catch (error) {
    console.error("❌ Eroare la PUT /flights/:id:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la actualizarea zborului.",
      error: error.message,
    });
  }
});

/**
 * 🔴 DELETE /flights/:id — Șterge un zbor
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await Flight.findByPk(id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Zborul cu ID ${id} nu a fost găsit.`,
      });
    }

    await flight.destroy();

    res.json({
      success: true,
      message: "Zbor șters cu succes ❌",
    });
  } catch (error) {
    console.error("❌ Eroare la DELETE /flights/:id:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la ștergerea zborului.",
      error: error.message,
    });
  }
});


module.exports = router;
