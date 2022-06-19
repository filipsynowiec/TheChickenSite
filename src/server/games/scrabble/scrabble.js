const { logger } = require("../../../utils/logger");
const { Deck } = require("./deck");
const { CheckManager } = require("./checkManager");

const BOARD_SIZE = 15;
const NR_OF_PLAYERS = 2;
const TILES_ON_HAND = 7;

class Scrabble {
  constructor(seats) {
    this._seats = seats;
    this._observers = [];
    this._checkManager = new CheckManager(BOARD_SIZE);
    this.setStartingState();
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  setStartingState() {
    this._board = [];
    this._hands = [];
    this._scores = [];
    this._message = null;
    this._turn = 0;
    this._end = false;
    for (let i = 0; i < BOARD_SIZE + 1; i++) {
      this._board[i] = [];
      for (let j = 0; j < BOARD_SIZE + 1; j++) {
        this._board[i][j] = null;
      }
    }
    this._deck = Deck.getDeck();
    for (let i = 0; i < NR_OF_PLAYERS; i++) {
      this._hands[i] = [];
      for (let j = 0; j < TILES_ON_HAND && this._deck.length > 0; ++j) {
        this._hands[i][j] = this._deck.pop();
      }
      this._scores[i] = 0;
    }
  }
  getScore(changes) {
    let result = 0;
    for (const change of changes) {
      result += change[0].value; //temporary
    }
    logger.info(`result ${result}`);
    return result;
  }
  endGame() {
    this._end = true;
    this._seats.gameEnded();
    let won = 0;
    for (let i = 1; i < NR_OF_PLAYERS; ++i) {
      if (this._scores[i] > this._scores[won]) {
        won = i;
      }
    }
    this._message = [null, `Game ended - ${this._seats.seats[won]} won`];
  }
  applyChanges(changes) {
    const handCopy = [...this._hands[this._turn]];
    let error = this._checkManager.checkIfCorrect(changes, this._board);
    if (error != "") {
      this._message = [this._seats.seats[this._turn], error];
      return;
    }
    for (const change of changes) {
      let index = handCopy.findIndex((tile) => {
        return tile.letter == change[0].letter;
      });
      if (index == -1) {
        logger.error("Used tile not in a hand!");
        return;
      }
      handCopy[index] = handCopy[handCopy.length - 1];
      handCopy.pop();
    }
    for (const change of changes) {
      this._board[change[1]][change[2]] = change[0];
    }
    while (handCopy.length < TILES_ON_HAND && this._deck.length > 0) {
      handCopy.push(this._deck.pop());
    }

    this._hands[this._turn] = [...handCopy];
    this._scores[this._turn] += this.getScore(changes);
    if (this._deck.length == 0) {
      this.endGame();
      return;
    }
    this._turn = (this._turn + 1) % NR_OF_PLAYERS;
  }
  restart() {
    this.setStartingState();
    this._turn = 0;
    this._observers.forEach((observer) => observer.sendStatus());
  }
  reroll(rerollTable) {
    for (const element of rerollTable) {
      if (this._deck.length <= 0) {
        this.endGame();
        return;
      }
      this._hands[this._turn][element] = this._deck.pop();
    }
  }
  updateGame(data) {
    if (data.reroll) {
      this.reroll(data.reroll);
      this._turn = (this._turn + 1) % NR_OF_PLAYERS;
    } else {
      this.applyChanges(data.changes);
    }
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    let hands = {};
    let scores = {};
    for (let i = 0; i < NR_OF_PLAYERS; ++i) {
      hands[this._seats.seats[i]] = [...this._hands[i]];
      scores[this._seats.seats[i]] = this._scores[i];
    }

    let message = null;
    if (this._message) {
      message = [...this._message];
      this._message = null;
    }
    return {
      running: this._seats.getRunning(),
      board: this._board,
      scores: scores,
      hands: hands,
      active: this._seats.seats[this._turn],
      message: message,
      deckSize: this._deck.length,
    };
  }
  getHTMLLocation() {
    return "src/server/games/scrabble/scrabble.html";
  }
}

module.exports = {
  Scrabble: Scrabble,
};
