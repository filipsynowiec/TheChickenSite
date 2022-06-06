const config = require("../../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.game = require("./game.model.js")(sequelize, Sequelize);
db.score = require("./score.model.js")(sequelize, Sequelize);

db.role.hasMany(db.user, { foreignKey: "role_id" });
db.user.hasMany(db.score, { foreignKey: "user_id" });
db.game.hasMany(db.score, { foreignKey: "game_id" });

db.ROLES = ["admin", "moderator", "user"];
db.GAMES = ["EGG-GAME", "TIC-TAC-TOE", "SCRABBLE"];
module.exports = db;
