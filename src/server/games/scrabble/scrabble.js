const { logger } = require("../../../utils/logger");
const { Deck } = require("./deck");

const BOARD_SIZE = 15
const NR_OF_PLAYERS = 2
const TILES_ON_HAND = 7

class Scrabble {
    constructor(seats) {
        this._seats = seats;
        this._observers = [];
        this._board = [];
        this._hands = [];
        this._scores = [];
        this.setStartingState();
    }
    registerObserver(observer) {
        this._observers.push(observer);
    }
    setStartingState() {
        this._turn = 0;
        this._end = false;
        for (let i = 0; i < BOARD_SIZE; i++) {
            this._board[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                this._board[i][j] = null;
            }
        }
        this._deck = new Deck().deck;
        for (let i = 0; i < NR_OF_PLAYERS; i++) {
            this._hands[i] = [];
            for(let j=0; j<TILES_ON_HAND && this._deck.length>0; ++j) {
                this._hands[i][j] = this._deck.pop();
            }
            this._scores[i] = 0;
        }
    }
    restart() {
        this.setStartingState();
        this._observers.forEach((observer) => observer.sendStatus());
    }
    updateGame(data) {
        this.applyChanges(data.changes); //to be written
        this._observers.forEach((observer) => observer.sendStatus());
    }
    getStatus() {
        return {
            turn: this._turn,
            end: this._end,
            board: this._board,
            scores: this._scores,
            hands: this._hands,
            active: this._seats.seats[this._turn],
        }
    }
    getHTMLLocation() {
        return "server/games/scrabble/scrabble.html";
    }
}

module.exports = {
    Scrabble: Scrabble,
};