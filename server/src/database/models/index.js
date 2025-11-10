const User = require("./user");
const Flight = require("./flight");
const Booking = require("./booking");
const Cart = require("./cart"); // 🟢 Importăm modelul de coș

// 🧩 Relații pentru Booking
User.hasMany(Booking, { foreignKey: "userId", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "userId" });

Flight.hasMany(Booking, { foreignKey: "flightId", onDelete: "CASCADE" });
Booking.belongsTo(Flight, { foreignKey: "flightId" });

// 🧩 Relații pentru Cart
User.hasMany(Cart, { foreignKey: "user_id", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Flight.hasMany(Cart, { foreignKey: "flight_id", onDelete: "CASCADE" });
Cart.belongsTo(Flight, { foreignKey: "flight_id" });

// ✅ Exportăm toate modelele
module.exports = { User, Flight, Booking, Cart };
