const { logger } = require("../../utils/logger");
const NR_OF_SEATS = 2;

class Seats {
  constructor() { // NR OF SEATS in constructor?
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

  claimSeat(data) {
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      if (this.seats[i] == data.name) {
        this.seats[i] = null;
      }
    }
    this._seats[data.seat] = data.name;
    this._observers.forEach((obs) => obs.sendSeats());
    this._observers.forEach((observer) => observer.sendStatus());
  }
}

module.exports = { Seats };
