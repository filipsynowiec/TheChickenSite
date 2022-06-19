const { DictionaryGenerator } = require("./dictionaryGenerator");

let BOARD_SIZE, MIDDLE_OF_BOARD;

class CheckManager {
  constructor(boardSize) {
    BOARD_SIZE = boardSize;
    MIDDLE_OF_BOARD = Math.floor(BOARD_SIZE / 2)
    this._dictionary = DictionaryGenerator.getDictionary();
  }
  checkWord(word) {
    if (word.length < 2) {
      return true;
    }
    return this._dictionary.has(word);
  }
  checkIfCorrect(changes, board) {
    if (changes.length == 0) {
      return "Use letters to make word!";
    }
    
    if (board[MIDDLE_OF_BOARD][MIDDLE_OF_BOARD] == null) {
      let illegal = true;
      for (const change of changes) {
        if (change[1] == MIDDLE_OF_BOARD && change[2] == MIDDLE_OF_BOARD) {
          illegal = false;
        }
      }
      if (illegal) {
        return "First word must cover center!";
      }
    } else {
      let friend = false;
      for (const change of changes) {
        const x = change[1];
        const y = change[2];
        if (change[1] > 0 && board[x - 1][y] != null) {
          friend = true;
        } else if (change[2] > 0 && board[x][y - 1] != null) {
          friend = true;
        } else if (board[x + 1][y] != null) {
          friend = true;
        } else if (board[x][y + 1] != null) {
          friend = true;
        }
      }
      if (!friend) {
        return "Placed word must touch already placed ones!";
      }
    }

    let horizontal = true;
    for (let i = 1; i < changes.length; ++i) {
      if (changes[i][1] != changes[0][1]) {
        horizontal = false;
      }
    }
    if (!horizontal) {
      for (let i = 1; i < changes.length; ++i) {
        if (changes[i][2] != changes[0][2]) {
          return "Place your letters in 1 column or row!";
        }
      }
    }

    if (horizontal) {
      let start = false;
      let end = false;
      for (let i = 0; i < BOARD_SIZE; ++i) {
        let isInChanges = false;
        for (const change of changes) {
          if (change[2] == i) {
            isInChanges = true;
          }
        }
        if (isInChanges) {
          if (!start) {
            start = true;
            continue;
          }
          if (end) {
            return "Placed letters must make a connected word!";
          }
        } else {
          if (start && board[changes[0][1]][i] == null) {
            end = true;
          }
        }
      }
    } else {
      let start = false;
      let end = false;
      for (let i = 0; i < BOARD_SIZE; ++i) {
        let isInChanges = false;
        for (const change of changes) {
          if (change[1] == i) {
            isInChanges = true;
          }
        }
        if (isInChanges) {
          if (!start) {
            start = true;
            continue;
          }
          if (end) {
            return "Placed letters must make 1 connected word!";
          }
        } else {
          if (start && board[i][changes[0][2]] == null) {
            end = true;
          }
        }
      }
    }

    for (const change of changes) {
      if (board[change[1]][change[2]] != null) {
        logger.error("Filling already filled tile!");
        return "Filling already filled tile!";
      }
      board[change[1]][change[2]] = change[0];
    }
    for (let i = 0; i < BOARD_SIZE; i++) {
      let word = "";
      for (let j = 0; j < BOARD_SIZE + 1; j++) {
        if (board[i][j] != null) {
          word += board[i][j].letter;
        } else {
          if (!this.checkWord(word)) {
            for (const change of changes) {
              board[change[1]][change[2]] = null;
            }
            return 'Word "' + word + '" does not seem legit';
          }
          word = "";
        }
      }
    }
    for (let j = 0; j < BOARD_SIZE; j++) {
      let word = "";
      for (let i = 0; i < BOARD_SIZE + 1; i++) {
        if (board[i][j] != null) {
          word += board[i][j].letter;
        } else {
          if (!this.checkWord(word)) {
            for (const change of changes) {
              board[change[1]][change[2]] = null;
            }
            return 'Word "' + word + '" does not seem legit';
          }
          word = "";
        }
      }
    }
    return "";
  }
}

module.exports = {
  CheckManager: CheckManager,
};
