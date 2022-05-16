const { logger } = require("../../logger");
const EMPTY = 0
const CROSS = 1
const CIRCLE = 2
const FULL = 3

class TickTackToe {
  constructor(seats) {
    this._seats = seats;
    this._observers = [];
    this._turn = CROSS;
    this._won = EMPTY
    this._fields = []
    for (let i = 0; i < 9; i++) {
      this._fields[i] = EMPTY;
    }
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  cheackIfWon() {
    //cheak if row
    for(let row=0; row<3; ++row) {
      if(this._fields[row*3]==this._fields[row*3+1] && this._fields[row*3]==this._fields[row*3+2]) {
        if(this._fields[row*3] == CROSS) {
          return CROSS;
        } else if(this._fields[row*3] == CIRCLE) {
          return CIRCLE;
        }
      }
    }
    //cheak if column
    for(let column=0; column<3; ++column) {
      if(this._fields[column]==this._fields[column+3] && this._fields[column]==this._fields[column+6]) {
        if(this._fields[column] == CROSS) {
          return CROSS;
        } else if(this._fields[column] == CIRCLE) {
          return CIRCLE;
        }
      }
    }
    //cheak if diagonal
    if( (this._fields[0]==this._fields[4] && this._fields[0]==this._fields[8]) ||
        (this._fields[2]==this._fields[4] && this._fields[2]==this._fields[6]) ) {
      if(this._fields[4] == CROSS) {
        return CROSS;
      } else if(this._fields[4] == CIRCLE) {
        return CIRCLE;
      }
    }
    for(let i=0; i<9; ++i) {
      if(this._fields[i] == EMPTY) {
        return EMPTY;
      }
    }
    return FULL;
  }
  changeField(x) {
    if(this._fields[x] != EMPTY) {
      logger.error(`Alredy filled ${x}`);
      return;
    }
    if(this._won != EMPTY) {
      logger.error("Alredy won");
      return;
    }
    this._fields[x] = this._turn;
    this._turn = (this._turn==CROSS)? CIRCLE: CROSS;
    this._won = this.cheackIfWon();
    this._observers.forEach((observer) => observer.sendStatus());
  }
  restart() {
    for (var i = 0; i < 9; i++) {
      this._fields[i] = EMPTY;
    }
    this._turn = CROSS;
    this._won = false;
  }
  updateGame(data) {
    if(data.restart == true) {
      this.restart();
    } else {
      this.changeField(data.field)
    }
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    return {
      turn: this._turn,
      won: this._won,
      fields: this._fields,
      active: this._seats.seats[(this._turn == CROSS)? 0: 1],
    }
  }
  getHTMLLocation() {
    return "server/games/tickTackToe/tickTackToe.html";
  }
}

module.exports = {
    TickTackToe: TickTackToe,
};