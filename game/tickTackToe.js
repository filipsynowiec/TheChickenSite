const { logger } = require("./logger");
const EMPTY = 0
const CROSS = 1
const CIRCLE = 2

class TickTackToe {
  constructor() {
    this._observers = [];
    this._turn = CROSS;
    this._fields = []
    for (var i = 0; i < 9; i++) {
      fields[i] = EMPTY;
    }
  }
  getEggValue() {
    return this._eggValue;
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  changeField(x) {
    if(fields(x) != EMPTY)
    this._eggValue = value;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  start() {
    this.changeEggValue(0);
  }
}

module.exports = {
    TickTackToe: TickTackToe,
};
