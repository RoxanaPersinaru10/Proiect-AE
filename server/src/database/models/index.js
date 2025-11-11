const sequelize = require("../server"); // importă instanța principală
const User = require("./user");
const Flight = require("./flight");
const Booking = require("./booking");
const Cart = require("./cart");

// Definim relațiile
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Flight.hasMany(Booking, { foreignKey: "flight_id" });
Booking.belongsTo(Flight, { foreignKey: "flight_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Flight.hasMany(Cart, { foreignKey: "flight_id" });
Cart.belongsTo(Flight, { foreignKey: "flight_id" });

module.exports = {
  sequelize,
  User,
  Flight,
  Booking,
  Cart,
};
