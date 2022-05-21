const fs = require("fs");
const { logger } = require("../../utils/logger");

/*
 * This is a class that handles all communications connected to game choosing.
 */
class GameChoiceManager {
  constructor() {
    this._GAMES = {};
  }
  get games() {
    return this._GAMES;
  }
  /* provides list of games to requesting socket */
  manage(socket) {
    logger.info(`${socket.id}`);
    socket.emit("getGamesList", { gamesList: this._GAMES });
  }
  /* loads supported games from json file*/
  loadGamesJSON() {
    let raw = fs.readFileSync("server/json/games.json");
    this._GAMES = JSON.parse(raw);
  }
}
module.exports = {
  GameChoiceManager,
};
