const { logger } = require("../../logger");

const {
  RoomMessage,
  RoomMessageType,
} = require("../../roomRequests");

const fs = require("fs");

class EggGame {
  constructor() {
    this._eggValue = 0;
    this._observers = [];
  }
  registerObserver(observer) {  // required
    this._observers.push(observer);
  }
  updateGame(data) {  // required
    if(data.increment != true) {
      logger.error("Incorrect request");
      return;
    }
    this._eggValue += 1;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() { // required
    return {eggValue: this._eggValue,}
  }
  getHTMLLocation() { // required
    return "server/games/eggGame/eggGame.html";
  }
}

module.exports = {
  EggGame: EggGame,
};
