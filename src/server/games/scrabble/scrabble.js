const { logger } = require("../../../utils/logger");
const { Deck } = require("./deck");
const fs = require("fs");

const BOARD_SIZE = 15;
const NR_OF_PLAYERS = 2;
const TILES_ON_HAND = 7;

class Scrabble {
    constructor(seats) {
        this._seats = seats;
        this._observers = [];
        this._allowedWords = new Set();
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('src/server/games/scrabble/allowed_words.txt')
        });
        let instance = this;
        lineReader.on('line', function (line) {
            instance._allowedWords.add( line );
        });
        console.log("allowed words length", this._allowedWords.size);
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
        for (let i = 0; i < BOARD_SIZE+1; i++) {
            this._board[i] = [];
            for (let j = 0; j < BOARD_SIZE+1; j++) {
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
    checkWord(word) {
        if(word.length < 2) {
            return true;
        }
        //console.log("Asumming correctness:", word);
        return this._allowedWords.has(word.toUpperCase());
    }
    checkIfCorrect(changes) {
        if(changes.length == 0) {
            this._message = [this._seats.seats[this._turn], "Use letter to make word!"];
            return false;
        }
        
        if(this._board[Math.floor(BOARD_SIZE/2)][Math.floor(BOARD_SIZE/2)] == null) {
            let illegal = true;
            for (const change of changes) {
                if(change[1] == Math.floor(BOARD_SIZE/2) && change[2] == Math.floor(BOARD_SIZE/2)) {
                    illegal = false;
                }
            }
            if(illegal) {
                this._message = [this._seats.seats[this._turn], "First word must cover center!"];
                return false;
            }
        } else {
            let friend = false;
            for (const change of changes) {
                if(change[1] > 0 && this._board[change[1]-1][change[2]] != null) {
                    friend = true;
                } else if(change[2] > 0 && this._board[change[1]][change[2]-1] != null) {
                    friend = true;
                } else if(this._board[change[1]+1][change[2]] != null) {
                    friend = true;
                } else if(this._board[change[1]][change[2+1]] != null) {
                    friend = true;
                }
            }
            if(!friend) {
                this._message = [this._seats.seats[this._turn], "Placed word must touch already placed ones!"];
                return false;
            }
        }

        let horizontal = true;
        for(let i=1; i<changes.length; ++i) {
            if(changes[i][1] != changes[0][1]) {
                horizontal = false;
            }
        }
        if(!horizontal) {
            for(let i=1; i<changes.length; ++i) {
                if(changes[i][2] != changes[0][2]) {
                    this._message = [this._seats.seats[this._turn], "Place your letters in 1 column or row!"];
                    return false;
                }
            }
        }
        
        if(horizontal) {
            let start = false;
            let end = false;
            for(let i=0; i<BOARD_SIZE; ++i) {
                let isInChanges = false;
                for(const change of changes) {
                    if(change[2] == i) {
                        isInChanges = true;
                    }   
                }
                if(isInChanges) {
                    if(!start) {
                        start = true;
                        continue;
                    }
                    if(end) {
                        this._message = [this._seats.seats[this._turn], "Placed letters must make 1 word!"];
                        return false;
                    }
                } else {
                    if(start && this._board[changes[0][1]][i] == null) {
                        end = true;
                    }
                }
            }
        } else {
            let start = false;
            let end = false;
            for(let i=0; i<BOARD_SIZE; ++i) {
                let isInChanges = false;
                for(const change of changes) {
                    if(change[1] == i) {
                        isInChanges = true;
                    }   
                }
                if(isInChanges) {
                    if(!start) {
                        start = true;
                        continue;
                    }
                    if(end) {
                        this._message = [this._seats.seats[this._turn], "Placed letters must make 1 base word!"];
                        return false;
                    }
                } else {
                    if(start && this._board[i][changes[0][2]] == null) {
                        end = true;
                    }
                }
            }
        }

        for(const change of changes) {
            if(this._board[change[1]][change[2]] != null) {
                logger.error("Filling already filled tile!");
                return false;
            }
            this._board[change[1]][change[2]] = change[0];
        }
        for (let i = 0; i < BOARD_SIZE; i++) {
            let word = "";
            for (let j = 0; j < BOARD_SIZE+1; j++) {
                if(this._board[i][j] != null) {
                    word += this._board[i][j].letter;
                } else {
                    if(!this.checkWord(word)) {
                        this._message = [this._seats.seats[this._turn], "Word \"" + word + "\" does not seem legit"];
                        for(const change of changes) {
                            this._board[change[1]][change[2]] = null;
                        }
                        return false;
                    }
                    word = "";
                }
            }
        }
        for (let j = 0; j < BOARD_SIZE; j++) {
            let word = "";
            for (let i = 0; i < BOARD_SIZE+1; i++) {
                if(this._board[i][j] != null) {
                    word += this._board[i][j].letter;
                } else {
                    if(!this.checkWord(word)) {
                        this._message = [this._seats.seats[this._turn], "Word \"" + word + "\" does not seem legit"];
                        for(const change of changes) {
                            this._board[change[1]][change[2]] = null;
                        }
                        return false;
                    }
                    word = "";
                }
            }
        }

        return true;
    }
    getScore(changes) {
        let result=0;
        for(const change of changes) {
            result += change[0].value; //temporary
        }
        console.log(`result ${result}`);
        return result;
    }
    endGame() {
        this._end = true;
        this._seats.gameEnded();
        let won = 0;
        for(let i=1; i<NR_OF_PLAYERS; ++i) {
            if(this._scores[i]>this._scores[won]) {
                won = i;
            }
        }
        this._message = [null, `Game ended - ${this._seats.seats[won]} won`];
    }
    applyChanges(changes) {
        //console.log(`applyChanges ${changes}`);
        const handCopy = [...this._hands[this._turn]];
        if(!this.checkIfCorrect(changes)) {
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
            this._board[change[1]][change[2]] = change[0];
        }
        while(handCopy.length<TILES_ON_HAND && this._deck.length>0) {
            handCopy.push(this._deck.pop());
        }
        
        this._hands[this._turn] = [...handCopy];
        this._scores[this._turn] += this.getScore(changes);
        if(this._deck.length==0) {
            this.endGame();
            return;
        }
        this._turn = (this._turn+1)%NR_OF_PLAYERS;
    }
    restart() {
        this.setStartingState();
        this._turn = 0;
        this._observers.forEach((observer) => observer.sendStatus());
    }
    reroll(rerollTable) {
        for(const element of rerollTable) {
            if(this._deck.length<=0) {
                this.endGame();
                return;
            }
            this._hands[this._turn][element] = this._deck.pop();
        }
        this._turn = (this._turn+1)%NR_OF_PLAYERS;
    }
    updateGame(data) {
        if(data.reroll) {
            this.reroll(data.reroll);
        } else {
            this.applyChanges(data.changes);
        }
        this._observers.forEach((observer) => observer.sendStatus());
    }
    getStatus() {
        let hands = {};
        let scores = {};
        for(let i=0; i<NR_OF_PLAYERS; ++i) {
            hands[this._seats.seats[i]] = [...this._hands[i]];
            scores[this._seats.seats[i]] = this._scores[i];
        }
        
        let message = null;
        if(this._message) {
            message = [...this._message]
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
        }
    }
    getHTMLLocation() {
        return "src/server/games/scrabble/scrabble.html";
    }
}

module.exports = {
    Scrabble: Scrabble,
};