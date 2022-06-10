// TODO: move to config

module.exports = Object.freeze({
  PORT: process.env.PORT || 1337,
  URL: `http://127.0.0.1:${process.env.PORT || 1337}/`, // port hardcoded here
  ROOM_URL_LENGTH: 8,
});
