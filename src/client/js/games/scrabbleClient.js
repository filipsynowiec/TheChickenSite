const NR_OF_PLAYERS = 2;

const MIDDLE_OF_BOARD = Math.floor(BOARD_SIZE / 2);

class ScrabbleClient {
  constructor(socket) {
    this._socket = socket;
    let instance = this;

    document.getElementById("leave-room").innerHTML =
      '<a class="nav-link nav-link-left" href="../rooms?game=SCRABBLE">Leave room</a>';

    getUserData().then((data) => {
      instance._name = data.name;
    });

    this._hand = [];
    this._changes = [];
    this._graphic = new ScrabbleGraphicClient(BOARD_SIZE);

    this._socket.on("updateStatus", (data) => instance.updateStatus(data));
    this._socket.on("gameHTML", (data) => {
      instance.updateHTML("game-area", data.gameHTML);
      instance.sendClientReady(instance);
      instance.startGame();
    });
  }
  updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  setStartingState() {
    this._selected = null;
    for (const change of this._changes) {
      this._graphic.makeEmpty(change[1], change[2]);
      if (change[1] == MIDDLE_OF_BOARD && change[2] == MIDDLE_OF_BOARD) {
        this._graphic.makeStarting(MIDDLE_OF_BOARD, MIDDLE_OF_BOARD);
      }
    }
    this._changes = [];
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < BOARD_SIZE; ++j) {
        this._graphic.setDisabledBoard(i, j, true);
      }
    }
    this._used = new Set();
    for (let i = 0; i < this._hand.length; ++i) {
      this._graphic.setDisabledHand(i, false);
      this._graphic.setSelectedHand(i, false);
    }
  }
  select(x) {
    this._graphic.setSelectedHand(x, true);
    this._selected = x;
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < BOARD_SIZE; ++j) {
        if (this._board[i][j] == null) {
          this._graphic.setDisabledBoard(i, j, false);
        }
      }
    }
    for(const change of this._changes) {
        this._graphic.setDisabledBoard(change[1], change[2], true);
    }
  }
  unselect(x) {
    this._graphic.setSelectedHand(x, false);
    this._selected = null;
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < BOARD_SIZE; ++j) {
        this._graphic.setDisabledBoard(i, j, true);
      }
    }
  }
  clickBoard(x, y) {
    if (this._selected == null || this._board[x][y]) {
      console.error("This tile should heve been disabled!");
      return;
    }
    const newChange = [this._hand[this._selected], x, y];
    this._changes.push(newChange);
    this._used.add(this._selected);

    this._graphic.makeSelected(x, y, this._hand[this._selected].letter);
    this._graphic.setDisabledHand(this._selected, true);
    this.unselect(this._selected);
  }
  clickHand(a) {
    if (this._used.has(a)) {
      console.error("Letter already used");
      return;
    }
    if (this._selected == a) {
      this.unselect(a);
    } else {
      if (this._selected != null) {
        this.unselect(this._selected);
      }
      this.select(a);
    }
  }

  updateStatus(data) {
    this._graphic.clearHandPane();
    if (!data.running && this._hand.length == 0) {
      return;
    }
    this._hand = [];
    this._board = data.board;
    this.setStartingState();

    if (this._name in data.hands) {
      this._hand = data.hands[this._name];
    }
    for (let i = 0; i < this._hand.length; ++i) {
      const instance = this;
      this._graphic.addHandButton(
        i,
        `${this._hand[i].letter}(${this._hand[i].value})`,
        () => {
          instance.clickHand(i);
        }
      );
      if (data.active != this._name || !data.running) {
        this._graphic.setDisabledHand(i, true);
      }
    }
    this._graphic.setShowControlButtons(
      data.active == this._name && data.running
    );
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < BOARD_SIZE; ++j) {
        if (data.board[i][j]) {
          this._graphic.placeTile(i, j, data.board[i][j].letter);
        } else {
          this._graphic.makeEmpty(i, j);
        }
      }
    }
    if (!data.board[MIDDLE_OF_BOARD][MIDDLE_OF_BOARD]) {
      this._graphic.makeStarting(MIDDLE_OF_BOARD, MIDDLE_OF_BOARD);
    }
    let scores = "";
    for (const name of Object.keys(data.scores)) {
      if (name != "null") {
        scores += `${name} - ${data.scores[name]}, `;
      }
    }
    this._graphic.writeScore(
      scores.slice(0, -2) + "\nDeck Size: " + data.deckSize
    );
    if (data.message) {
      if (data.message[0] == this._name) {
        this._graphic.showError(data.message[1]);
      } else if (data.message[0] == null) {
        this._graphic.showInfo(data.message[1]);
      }
    }
  }

  startGame() {
    const instance = this;
    this._graphic.createBoardButtons((i, j) => {
      instance.clickBoard(i, j);
    });
    this._graphic.createControlButtons(
      () => {
        instance.setStartingState();
      },
      () => {
        instance._socket.emit("requestAction", { changes: instance._changes });
      },
      () => {
        let toReroll = [];
        for (let i = 0; i < this._hand.length; ++i) {
          toReroll.push(i);
        }
        instance._socket.emit("requestAction", { reroll: toReroll });
      }
    );
    this._graphic.setShowControlButtons(false);
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    console.log(`Sending client ready`);
  }
}

let client = new ScrabbleClient(getIO());
