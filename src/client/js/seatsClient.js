const NR_OF_SEATS = 2;

class SeatsClient {
  constructor(socket) {
    this._socket = socket;
    this._buttons = [];
    const instance = this;
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      this._buttons[i] = document.createElement("button");

      this._buttons[i].style.width = "200px";
      this._buttons[i].style.height = "50px";
      this._buttons[i].style.fontSize = "20px";
      this._buttons[i].style.margin = "5px";

      this._buttons[i].onclick = () => {
        instance.claimSeat(i);
      };
      this._buttons[i].innerHTML = "-";
      let div = document.createElement("div");
      div.innerText = "Player " + (i + 1);
      div.appendChild(this._buttons[i]);
      document.getElementById("seats_area").appendChild(div);
    }

    this._startButton = document.createElement("button");
    this._startButton.innerHTML = "Start"
    document.getElementById("seats_area").appendChild(this._startButton);
    this._startButton.onclick = () => {
      instance._socket.emit("sendSeatClaim", { running: true });
    };

    document.getElementById("seats_area").style.marginBottom = "25px";

    this._socket.on("updateSeats", (data) => {
      instance.updateSeats(data);
      console.log("Updated seats");
    });

    getName((name) => {
      instance._name = name;
    });
  }

  claimSeat(i) {
    let name = this._name;
    this._socket.emit("sendSeatClaim", {
      name: name,
      seat: i,
    });
  }

  updateSeats(data) {
    this._startButton.disabled = data.gameRunning;
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      if (data.seats[i] == null) {
        this._buttons[i].innerHTML = "-";
      } else {
        this._buttons[i].innerHTML = data.seats[i];
      }
    }
    for(const button of this._buttons) {
      button.disabled = data.gameRunning;
    }
  }
}

let seatsClient = new SeatsClient(io());
