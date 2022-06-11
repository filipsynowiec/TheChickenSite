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

    logger.info(`Data sent by player with id=${data.userId}`);

    queries
      .getScore(data.userId, "EGG-GAME")
      .then((oldScore) => {
        logger.info(`Player's old score is ${oldScore}`);
        return queries.updateScore(data.userId, "EGG-GAME", oldScore + 1);
      })
      .then(() => logger.info("Score increased"))
      .catch((err) => {
        logger.error(err);
      });

    this._observers.forEach((observer) => observer.sendStatus());
  }
  restart() {
    // required
    this._eggValue = 0;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    // required
    return { eggValue: this._eggValue };
  }
  getHTMLLocation() {
    // required
    return "src/server/games/eggGame/eggGame.html";
  }
}

module.exports = {
  EggGame: EggGame,
};
