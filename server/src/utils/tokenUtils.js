// server/src/utils/token.js
const jwt = require("jsonwebtoken");

// Middleware pentru protejarea rutelor + debug complet
const verifyToken = (req, res, next) => {
  console.log("\n🧩 [DEBUG] Headers primite:", req.headers);

  const bearerToken = req.headers["authorization"];
  console.log("🧩 [DEBUG] Header Authorization:", bearerToken);

  if (!bearerToken) {
    console.log("🚫 [DEBUG] Lipsă header Authorization!");
    return res.status(401).json({
      success: false,
      message: "Token lipsă din header Authorization",
    });
  }

  const token = bearerToken.split(" ")[1];
  console.log("🧩 [DEBUG] Token extras:", token);

  if (!token) {
    console.log("🚫 [DEBUG] Token invalid sau null!");
    return res.status(400).json({
      success: false,
      message: "Token invalid",
    });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ [DEBUG] Token invalid:", err.message);
      return res
        .status(400)
        .json({ success: false, message: "Token invalid", data: {} });
    }

    console.log("✅ [DEBUG] Token valid — userId:", decoded.id, "role:", decoded.role);

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// ✅ Funcție simplă de verificare token (folosită la /auth/check)
const isValidToken = (token) => {
  try {
    console.log("🔐 TOKEN_SECRET la VERIFY:", process.env.TOKEN_SECRET);

    jwt.verify(token, process.env.TOKEN_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { verifyToken, isValidToken };
