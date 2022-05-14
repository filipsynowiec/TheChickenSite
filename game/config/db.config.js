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
// sudo docker run --name psql -e POSTGRES_USER=dude -e POSTGRES_PASSWORD=duderino -e POSTGRES_DB=TCSDB -p 5432:5432 -d postgres
