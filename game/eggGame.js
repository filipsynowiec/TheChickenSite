const { logger } = require("./logger");

const {
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");

const fs = require("fs");

class EggGame {
  constructor() {
    this._eggValue = 0;
    this._observers = [];
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  updateGame(data) {
    this._eggValue = data.eggValue;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    return {eggValue: this._eggValue,}
  }
  getHTMLLocation() {
    return "eggGame.html";
  }
  start() {
    this._eggValue = 0;
  }
}

module.exports = {
  EggGame: EggGame,
};
