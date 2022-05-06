const { logger } = require("./logger");
const EMPTY = 0
const CROSS = 1
const CIRCLE = 2
const FULL = 3

class TickTackToe {
  constructor() {
    this._observers = [];
    this._turn = CROSS;
    this._won = EMPTY
    this._fields = []
    for (var i = 0; i < 9; i++) {
      fields[i] = EMPTY;
    }
  }
  registerObserver(observer) {
    this._observers.push(observer);
  }
  updateGame(data) { 
    changeField(data.field)
    this._observers.forEach((observer) => observer.sendStatus());
  }
  cheackIfWon() {
    //cheak if row
    for(var row=0; row<3; ++row) {
      if(this._fields[row*3]==this._fields[row*3+1] && this._fields[row*3]==this._fields[row*3+2]) {
        if(this._fields[row*3] == CROSS) {
          return CROSS;
        } else if(this._fields[row*3] == CIRCLE) {
          return CIRCLE;
        }
      }
    }
    //cheak if column
    for(var column=0; column<3; ++column) {
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
        (this._fields[2]==this._fields[4] && this._fields[0]==this._fields[6]) ) {
      if(this._fields[4] == CROSS) {
        return CROSS;
      } else if(this._fields[4] == CIRCLE) {
        return CIRCLE;
      }
    }
    this._fields.forEach(field => {
      if(field == EMPTY) {
        return EMPTY;
      }
    });
    return FULL;
  }
  changeField(x) {
    if(this._fields(x) != EMPTY) {
      throw new Error("Alredy filled")
    }
    if(this._won != EMPTY) {
      throw new Error("Alredy won")
    }
    this._fields[x] = this._turn;
    this._turn = (this._turn==CROSS)? CIRCLE: CROSS;
    this._won = cheackIfWon();
    this._observers.forEach((observer) => observer.sendStatus());
  }
  getStatus() {
    return {
      turn: this._turn,
      won: this._won,
      fields: this._fields,
    }
  }
  getHTMLLocation() {
    return "tickTackToe.html";
  }
}

module.exports = {
    TickTackToe: TickTackToe,
};
