const { logger } = require("../../../utils/logger");
const queries = require("../../../database/dbQueries");

class EggGame {
  constructor(seats) {
    this._seats = seats;
    this._eggValue = 0;
    this._observers = [];
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  updateGame(data) {
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
    this._eggValue = 0;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    return { 
      eggValue: this._eggValue, 
      running: this._seats.getRunning(), 
      allowed: [...this._seats.seats]};
  }
  getHTMLLocation() {
    return "src/server/games/eggGame/eggGame.html";
  }
}

module.exports = {
  EggGame: EggGame,
};
