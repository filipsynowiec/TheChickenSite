const { logger } = require("./logger");
const NR_OF_SEATS = 2;

class Seats {
  constructor(chatHistory) {
    this._observers = [];
    this._seats = [];
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      this._seats.push(null);
    }
  }

  get seats() {
    return this._seats;
  }

  registerObserver(observer) {
    this._observers.push(observer);
  }

  claimSeat(data, instance) {
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      if (this.seats[i] == data.name) {
        this.seats[i] = null;
      }
    }
    instance._seats[data.seat] = data.name;
    instance._observers.forEach((obs) => obs.sendSeats());
    instance._observers.forEach((observer) => observer.sendStatus());
  }
}

module.exports = { Seats };
