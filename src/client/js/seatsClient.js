let csloggerSeats = new CSLogger("ChatClient");
const NR_OF_SEATS = 2;

class SeatsClient {
  constructor(socket, maxSeats) {
    this._socket = socket;
    this._maxSeats = maxSeats;
    this._buttons = [];
    const instance = this;
    for (let i = 0; i < maxSeats; ++i) {
      let template = document.getElementById("seat-template");
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      htmlElement.querySelector(".player").innerHTML = "Player " + (i + 1);
      this._buttons[i] = htmlElement.querySelector(".btn");
      this._buttons[i].onclick = () => {
        instance.claimSeat(i);
      };
      document.getElementById("seats-area").appendChild(htmlElement);
    }
    this._startButton = document.getElementById("start-game-button");
    this._startButton.onclick = () => {
      instance._socket.emit("sendSeatClaim", { running: true });
    };

    this._socket.on("updateSeats", (data) => {
      instance.updateSeats(data);
      csloggerSeats.info("Updated seats");
    });

    getUserData().then((data) => {
      instance._name = data.name;
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
        this._buttons[i].classList.remove("seat-taken");
        this._buttons[i].classList.add("seat-empty");
      } else {
        this._buttons[i].innerHTML = data.seats[i];
        this._buttons[i].classList.add("seat-taken");
        this._buttons[i].classList.remove("seat-empty");
      }
    }
    for (const button of this._buttons) {
      button.disabled = data.gameRunning;
    }
  }
}

let seatsClient = new SeatsClient(getIO());
