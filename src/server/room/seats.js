const { logger } = require("../../utils/logger");
const queries = require("../../database/dbQueries");
const NR_OF_SEATS = 2;
const ELO_GAIN = 10;

class Seats {
  constructor() {
    // NR OF SEATS in constructor?
    this._observers = [];
    this._seatsIds = [];
    this._seats = [];
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      this._seatsIds.push(null);
    }
    this._gameRunning = false;
  }

  get seats() {
    return this._seats;
  }

  getRunning() {
    return this._gameRunning;
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

  gameEnded(winner, gameName) {
    if (!this._gameRunning) {
      logger.error(`Game not even started`);
      return;
    }
    if(winner != null) {
      let winnerId  = this._seatsIds[winner];
      queries
        .getScore(winnerId, gameName)
        .then((oldScore) => {
          logger.info(`Player's old score is ${oldScore}`);
          return queries.updateScore(winnerId, gameName, oldScore + ELO_GAIN);
        })
        .then(() => logger.info("Score increased"))
        .catch((err) => {
          logger.error(err);
        });
    }
    
    this._gameRunning = false;
    this._observers.forEach((obs) => obs.sendSeats());
  }

  claimSeat(clientId, data) {
    if (data.running) {
      if (this._gameRunning) {
        logger.error(`Already running`);
        return;
      }
      this._gameRunning = true;
      this._observers.forEach((obs) => obs.restartGame());
    } else {
      this.abandonSeat(clientId);
      this._seatsIds[data.seat] = clientId;
      this._seats[data.seat] = data.name;
      logger.info(`Seat ${data.seat} taken by ${clientId} - ${data.name}`);
    }

    this._observers.forEach((obs) => obs.sendSeats());
  }
  abandonSeat(clientId) {
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      if (this._seatsIds[i] == clientId) {
        this._seats[i] = null;
        this._seatsIds[i] = null;
        logger.info(`Seat ${i} abandoned by ${clientId}`);
      }
    }
  }
}

module.exports = { Seats };
