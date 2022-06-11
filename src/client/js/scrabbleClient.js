const BOARD_SIZE = 15;
const NR_OF_PLAYERS = 2;

class ScrabbleClient {
  constructor(socket) {
    this._socket = socket;
    let instance = this;

    document.getElementById("leave-room").innerHTML =
      '<a class="nav-link nav-link-left" href="../rooms?game=SCRABBLE">Leave room</a>';

    this._board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      this._board[i] = [];
    }
    getUserData().then((data) => {
      instance._name = data.name;
    });

    this._hand = [];
    this._handButtons = [];
    this._changes = [];
    this.setStartingState();

    this._socket.on("updateStatus", (data) => instance.updateStatus(data));
    this._socket.on("gameHTML", (data) => {
      instance.updateHTML("game-area", data.gameHTML);
      instance.sendClientReady(instance);
      instance.startGame(instance);
    });
  }
  updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  setStartingState() {
    this._selected = null;
    this._used = new Set();
    for (const change of this._changes) {
      console.log(change);
      this._board[change[1]][change[2]].innerText = "";
    }
    this._changes = [];
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < this._board[i].length; ++j) {
        this._board[i][j].style.background = "white";
        this._board[i][j].disabled = true;
      }
    }
    for (let i = 0; i < this._handButtons.length; ++i) {
      this._handButtons[i].style.background = "white";
      this._handButtons[i].disabled = false;
    }
  }
  select(a) {
    //console.log(`select ${a}`);
    this._selected = a;
    this._handButtons[a].style.background = "yellow";
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < this._board[i].length; ++j) {
        if (this._board[i][j].innerText == "") {
          this._board[i][j].disabled = false;
        }
      }
    }
  }
  unselect(a) {
    //console.log(`unselect ${a}`);
    this._handButtons[a].style.background = "white";
    this._selected = null;
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < this._board[i].length; ++j) {
        this._board[i][j].disabled = true;
      }
    }
  }
  clickBoard(a, b) {
    if (this._selected == null || this._board[a][b].innerText != "") {
      console.error("This tile should heve been disabled!");
      return;
    }
    this._board[a][b].style.background = "green";
    this._board[a][b].innerText = this._hand[this._selected].letter;
    const newChange = [this._hand[this._selected], a, b];
    this._changes.push(newChange);
    this._used.add(this._selected);
    this._handButtons[this._selected].disabled = true;
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
    console.log(data);

    document.getElementById("hand-pane").innerHTML = "";
    if (!data.running && this._hand.length == 0) {
      return;
    }
    this._handButtons = [];
    this._hand = [];
    this.setStartingState();

    if (this._name in data.hands) {
      this._hand = data.hands[this._name];
    }
    for (let i = 0; i < this._hand.length; ++i) {
      this._handButtons[i] = document.createElement("button");
      this._handButtons[
        i
      ].innerText = `${this._hand[i].letter}(${this._hand[i].value})`;
      if (data.active != this._name || !data.running) {
        this._handButtons[i].disabled = true;
      }
      const instance = this;
      this._handButtons[i].onclick = () => {
        instance.clickHand(i);
      };
      this._handButtons[i].style.width = "50px";
      this._handButtons[i].style.height = "50px";
      this._handButtons[i].style.fontSize = "17px";
      this._handButtons[i].style.margin = "3px";
      this._handButtons[i].style.background = "white";
      document.getElementById("hand-pane").appendChild(this._handButtons[i]);
    }
    if (data.active == this._name && data.running) {
      let resetButton = document.createElement("button");
      resetButton.style.fontSize = "17px";
      resetButton.style.height = "50px";
      resetButton.style.marginLeft = "15px";
      resetButton.style.marginTop = "15px";
      resetButton.style.width = "150px";
      resetButton.innerText = "Reset";

      const instance = this;
      resetButton.onclick = () => {
        instance.setStartingState();
      };
      let div = document.createElement("div");
      div.appendChild(resetButton);

      let applyButton = document.createElement("button");
      applyButton.style.fontSize = "17px";
      applyButton.style.height = "50px";
      applyButton.style.marginLeft = "15px";
      applyButton.style.marginTop = "15px";
      applyButton.style.width = "150px";
      applyButton.innerText = "Apply";

      applyButton.onclick = () => {
        instance._socket.emit("requestAction", { changes: instance._changes });
      };
      div.appendChild(applyButton);
      document.getElementById("hand-pane").appendChild(div);
    }
    for (let i = 0; i < BOARD_SIZE; ++i) {
      for (let j = 0; j < this._board[i].length; ++j) {
        if (data.board[i][j]) {
          this._board[i][j].innerText = data.board[i][j].letter;
        }
      }
    }
    console.log(data.scores);
    let scores = "";
    for (const name of Object.keys(data.scores)) {
      if (name != "null") {
        scores += `${name} - ${data.scores[name]}, `;
      }
    }
    document.getElementById("scores").innerText = scores.slice(0, -2);
  }

  startGame(instance) {
    for (let i = 0; i < BOARD_SIZE; ++i) {
      let div = document.createElement("div");
      document.getElementById("board-pane").appendChild(div);
      for (let j = 0; j < BOARD_SIZE; ++j) {
        this._board[i][j] = document.createElement("button");

        this._board[i][j].style.width = "35px";
        this._board[i][j].style.height = "35px";
        this._board[i][j].style.fontSize = "18px";
        this._board[i][j].style.margin = "2px";
        this._board[i][j].style.verticalAlign = "top";
        this._board[i][j].style.background = "white";
        this._board[i][j].disabled = true;

        this._board[i][j].onclick = () => {
          instance.clickBoard(i, j);
        };
        div.appendChild(this._board[i][j]);
      }
    }
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    console.log(`Sending client ready`);
  }
}

let client = new ScrabbleClient(getIO());
