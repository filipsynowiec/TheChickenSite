const { logger } = require("../../../utils/logger");
const { Deck } = require("./deck");

const BOARD_SIZE = 15;
const NR_OF_PLAYERS = 2;
const TILES_ON_HAND = 7;

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
        this._deck = Deck.getDeck();
        for (let i = 0; i < NR_OF_PLAYERS; i++) {
            this._hands[i] = [];
            for(let j=0; j<TILES_ON_HAND && this._deck.length>0; ++j) {
                this._hands[i][j] = this._deck.pop();
            }
            this._scores[i] = 0;
        }
    }
    checkIfCorrect(changes) { 
        return true; //temporary
    }
    getScore(changes) {
        let result=0;
        for(const change of changes) {
            
            result += change[0].value; //temporary
        }
        console.log(`result ${result}`);
        return result;
    }
    applyChanges(changes) {
        //console.log(`applyChanges ${changes}`);
        const handCopy = [...this._hands[this._turn]];
        if(!this.checkIfCorrect(changes)) {
            logger.error("Not correct changes!");
            return;
        }
        for(const change of changes) {
            let index = handCopy.findIndex((tile) => {return tile.letter == change[0].letter});
            if(index == -1) {
                logger.error("Used tile not in a hand!");
                return;
            }
            handCopy[index] = handCopy[handCopy.length-1];
            handCopy.pop();
        }
        for(const change of changes) {
            if(this._board[change[1]][change[2]] != null) {
                logger.error("Filling already filled tile!");
                return;
            }
            this._board[change[1]][change[2]] = change[0];
        }
        while(handCopy.length<TILES_ON_HAND && this._deck.length>0) {
            handCopy.push(this._deck.pop());
        }
        if(this._deck.length==0) {
            this._end = true;
            this._seats.gameEnded();
        }
        this._hands[this._turn] = [...handCopy];
        this._scores[this._turn] += this.getScore(changes);
        this._turn = (this._turn+1)%NR_OF_PLAYERS;
    }
    restart() {
        this.setStartingState();
        this._turn = 0;
        this._observers.forEach((observer) => observer.sendStatus());
    }
    updateGame(data) {
        this.applyChanges(data.changes);
        this._observers.forEach((observer) => observer.sendStatus());
    }
    getStatus() {
        let hands = {};
        let scores = {};
        for(let i=0; i<NR_OF_PLAYERS; ++i) {
            hands[this._seats.seats[i]] = [...this._hands[i]];
            scores[this._seats.seats[i]] = this._scores[i];
        }
        
        return {
            running: this._seats.getRunning(),
            board: this._board,
            scores: scores,
            hands: hands,
            active: this._seats.seats[this._turn],
        }
    }
    getHTMLLocation() {
        return "src/server/games/scrabble/scrabble.html";
    }
}

module.exports = {
    Scrabble: Scrabble,
};