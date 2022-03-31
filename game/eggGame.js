const { logger } = require("./logger");

class EggGame {
    constructor(eggValue) {
        // this._eggValue = eggValue;
        this._observers = [];
    }
    getEggValue() { return this._eggValue; }
    registerObserver(observer) {
        this._observers.push(observer);
    }
    changeEggValue(value) {
        this._eggValue = value;
        this._observers.forEach(observer => observer.update());
    }
    start() {
        this.changeEggValue(0);
    }
}

module.exports = {
    EggGame: EggGame,
}