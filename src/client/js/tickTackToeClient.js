const EMPTY = 0;
const CROSS = 1;
const CIRCLE = 2;
const FULL = 3;

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
    console.log(data.active);
    console.log(this._name);
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
  startGame(instance) {
    for (let i = 0; i < 9; ++i) {
      this._buttons[i] = document.createElement("button");

      this._buttons[i].style.width = "100px";
      this._buttons[i].style.height = "100px";
      this._buttons[i].style.background = "teal";
      this._buttons[i].style.color = "white";
      this._buttons[i].style.fontSize = "50px";
      this._buttons[i].style.margin = "5px";
      this._buttons[i].style.verticalAlign = "top";

      this._buttons[i].onclick = () => {
        instance.clickField(instance, i);
      };
    }
    for (let i = 0; i < 3; ++i) {
      let div = document.createElement("div");
      document.getElementById("tick_tack_buttons").appendChild(div);
      for (let j = 0; j < 3; ++j) {
        div.appendChild(this._buttons[i * 3 + j]);
      }
    }
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    console.log(`Sending client ready`);
  }
}

let client = new TickTackToeClient(getIO());
