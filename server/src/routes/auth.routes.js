const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../database/models");
const { isValidToken } = require("../utils/tokenUtils");

const router = express.Router();
// Crează automat un cont de admin dacă nu există
(async () => {
  try {
    const existingAdmin = await User.findOne({ where: { email: "admin@admin.com" } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        name: "Administrator",
        email: "admin@admin.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Cont de admin creat: admin@admin.com / parola: admin");
    } else {
      console.log(" Contul de admin există deja.");
    }
  } catch (err) {
    console.error(" Eroare la crearea contului de admin:", err);
  }
})();



router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii.",
      });
    }

    // verifică dacă userul există deja
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Există deja un cont cu acest email.",
      });
    }

    // criptează parola
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "Cont creat cu succes!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Eroare la înregistrare:", err.message);
    res.status(500).json({
      success: false,
      message: "Eroare server.",
      error: err.message,
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Email incorect." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Parolă incorectă." });
    
    console.log(" TOKEN_SECRET la LOGIN:", process.env.TOKEN_SECRET);

    // generăm tokenul JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Autentificare reușită!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(" Eroare la login:", err.message);
    res.status(500).json({
      success: false,
      message: "Eroare server.",
      error: err.message,
    });
  }
});


//CHECK- Verificare token JWT
 
router.get("/check", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Lipsă token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilizatorul nu există" });
    }

    res.status(200).json({
      success: true,
      message: "Token valid ",
      user,
    });
  } catch (err) {
    console.error("Eroare la /auth/check:", err.message);
    res.status(401).json({
      success: false,
      message: "Token invalid sau expirat",
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.findAll({ order: [["created_at", "DESC"]] });

    if (!users.length) {
      return res.send("<h2>Nu există utilizatori în baza de date.</h2>");
    }

    const rows = users
      .map(
        (u) => `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${new Date(u.created_at).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    res.send(`
      <html>
        <head>
          <title>Utilizatori salvați</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Utilizatori existenți în baza de date</h2>
          <table>
            <tr>
              <th>ID</th><th>Nume</th><th>Email</th><th>Rol</th><th>Creat la</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("<h3>Eroare la afișarea utilizatorilor.</h3>");
  }
});


module.exports = router;