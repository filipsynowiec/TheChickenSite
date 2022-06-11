/*
module.exports = {
  HOST: "thechickensitedb.postgres.database.azure.com",
  USER: "tcs_user",
  PASSWORD: process.env.PSQL_PASSWORD, // password as env variable
  DB: "tcsdb_prod",
  port: 5432,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
//*/

//* For local testing
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
//*/

