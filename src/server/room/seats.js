const { logger } = require("../../utils/logger");
const NR_OF_SEATS = 2;

class Seats {
  constructor() { // NR OF SEATS in constructor?
    this._observers = [];
    this._seats = [];
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      this._seats.push(null);
    }
    this._gameRunning = false;
  }

  get seats() {
    return this._seats;
  }

  getSeatsStatus() {
    return {
      seats: this._seats,
      gameRunning: this._gameRunning,
    };
  }

  registerObserver(observer) {
    this._observers.push(observer);
  }

  gameEnded() {
    if(!this._gameRunning) {
      logger.error(`Game not even started`);
      return;
    }
    this._gameRunning = false;
    this._observers.forEach((obs) => obs.sendSeats());
  }

  claimSeat(data) {
    if(data.running) {
      if(this._gameRunning) {
        logger.error(`Already running`);
        return;
      }
      this._gameRunning = true;
      this._observers.forEach((obs) => obs.restartGame());
    } else {
      for (let i = 0; i < NR_OF_SEATS; ++i) {
        if (this.seats[i] == data.name) {
          this.seats[i] = null;
        }
      }
      this._seats[data.seat] = data.name;
    }

    this._observers.forEach((obs) => obs.sendSeats());
    //this._observers.forEach((observer) => observer.sendStatus());
  }
}

module.exports = { Seats };
