let csloggerTicTacToe = new CSLogger("TicTacToeClient");

const EMPTY = 0;
const CROSS = 1;
const CIRCLE = 2;
const FULL = 3;
const BUTTON_SIZE = "min(15vw, 10vh)";
const FONT_SIZE = "min(15vw, 8vh)";
const MARGIN_SIZE = "min(1vw, 1vh)";
class TickTackToeClient {
  constructor(socket) {
    this._socket = socket;
    let instance = this;

    document.getElementById("leave-room").innerHTML =
      '<a class="nav-link nav-link-left" href="../rooms?game=TIC-TAC-TOE">Leave room</a>';

    this._socket.on("updateStatus", (data) => instance.updateStatus(data));
    this._socket.on("gameHTML", (data) => {
      instance.updateHTML("game-area", data.gameHTML);
      instance.sendClientReady(instance);
      instance.startGame(instance);
    });
    this._buttons = [];
    getUserData().then((data) => {
      instance._name = data.name;
    });
  }
  updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  clickField(instance, index) {
    instance._socket.emit("requestAction", { field: index });
  }
  updateStatus(data) {
    csloggerTicTacToe.info(data.active);
    csloggerTicTacToe.info(this._name);
    if (data.active == this._name) {
      for (let i = 0; i < 9; ++i) {
        this._buttons[i].disabled = false;
      }
    }
    if (data.turn == CROSS) {
      document.getElementById("turn").innerHTML = "Turn: X";
    } else {
      document.getElementById("turn").innerHTML = "Turn: O";
    }
    document.getElementById("winner-pane").style.display = "none";

    for (let i = 0; i < 9; ++i) {
      switch (data.fields[i]) {
        case EMPTY:
          this._buttons[i].innerHTML = "";
          break;
        case CROSS:
          this._buttons[i].innerHTML = "X";
          break;
        case CIRCLE:
          this._buttons[i].innerHTML = "O";
          break;
      }
      if (data.fields[i] != EMPTY) {
        this._buttons[i].disabled = true;
      }
    }
    if (data.won != EMPTY) {
      let winner = "";
      switch (data.won) {
        case CROSS:
          winner = "X";
          break;
        case CIRCLE:
          winner = "O";
          break;
        case FULL:
          winner = "NONE";
          break;
      }
      for (let i = 0; i < 9; ++i) {
        this._buttons[i].disabled = true;
      }
      document.getElementById("winner").innerText = "Winner: " + winner;
      document.getElementById("winner-pane").style.display = "block";
      return;
    }
    if (data.active != this._name) {
      for (let i = 0; i < 9; ++i) {
        this._buttons[i].disabled = true;
      }
    }
  }
  createButton() {
    let button = document.createElement("button");
    button.style.height = BUTTON_SIZE;
    button.style.width = BUTTON_SIZE;
    button.style.background = "teal";
    button.style.fontSize = FONT_SIZE;
    button.style.color = "white";
    button.style.marginLeft = MARGIN_SIZE;
    button.style.verticalAlign = "top";
    return button;
  }
  startGame(instance) {
    for (let i = 0; i < 9; ++i) {
      this._buttons[i] = this.createButton();

      this._buttons[i].onclick = () => {
        instance.clickField(instance, i);
      };
    }
    for (let i = 0; i < 3; ++i) {
      let div = document.createElement("div");
      div.style.height = BUTTON_SIZE;
      div.style.marginTop = MARGIN_SIZE;
      document.getElementById("tick_tack_buttons").appendChild(div);
      for (let j = 0; j < 3; ++j) {
        div.appendChild(this._buttons[i * 3 + j]);
      }
    }
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    csloggerTicTacToe.info(`Sending client ready`);
  }
}

let client = new TickTackToeClient(getIO());
