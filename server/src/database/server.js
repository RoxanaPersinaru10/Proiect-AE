// server/database/server.js
const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "db.sqlite"), 
  logging: false,
});

sequelize
  .sync()
  .then(() => {
    console.log(" Models successfully (re)created.");
  })
  .catch((err) => {
    console.error(" Database sync error:", err);
  });

module.exports = sequelize; 
