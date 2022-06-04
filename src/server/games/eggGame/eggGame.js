const { logger } = require("../../../utils/logger");
const queries = require("../../../database/dbQueries");

const { RoomMessage, RoomMessageType } = require("../../room/roomRequests");

const fs = require("fs");

class EggGame {
  constructor() {
    this._eggValue = 0;
    this._observers = [];
  }
  registerObserver(observer) {
    // required
    this._observers.push(observer);
  }
  updateGame(data) {
    // required
    if (data.increment != true) {
      logger.error("Incorrect request");
      return;
    }
    this._eggValue += 1;

    let player_id = 1;

    queries
      .getScore(1, "EGG-GAME")
      .then((oldScore) => {
        logger.info(`Player's old score is ${oldScore}`);
        return queries.updateScore(1, "EGG-GAME", oldScore + 1);
      })
      .then(() => logger.info("Score increased"))
      .catch((err) => {
        logger.error(err);
      });

    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    // required
    return { eggValue: this._eggValue };
  }
  getHTMLLocation() {
    // required
    return "server/games/eggGame/eggGame.html";
  }
}

module.exports = {
  EggGame: EggGame,
};
