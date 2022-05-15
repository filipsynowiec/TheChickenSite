module.exports = {
  HOST: "localhost",
  USER: "dude",
  PASSWORD: "duderino",
  DB: "TCSDB",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

