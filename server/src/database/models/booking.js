// server/src/database/models/booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../server");
const User = require("./user");
const Flight = require("./flight");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    flight_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "flights", key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "plasată", // ex: plasată, confirmată, anulată
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// 🔗 Relații
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Flight.hasMany(Booking, { foreignKey: "flight_id" });
Booking.belongsTo(Flight, { foreignKey: "flight_id" });

module.exports = Booking;
