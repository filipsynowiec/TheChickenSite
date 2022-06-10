const NR_OF_SEATS = 2;

class SeatsClient {
  constructor(socket) {
    this._socket = socket;
    this._buttons = [];
    let instance = this;
    for (let i = 0; i < NR_OF_SEATS; ++i) {
      let template = document.getElementById("seat-template");
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      htmlElement.querySelector(".player").innerHTML = "Player " + (i + 1);
      this._buttons[i] = htmlElement.querySelector(".btn");
      this._buttons[i].onclick = () => {
        instance.claimSeat(i);
      };
      document.getElementById("seats-area").appendChild(htmlElement);
    }

    this._socket.on("updateSeats", (data) => {
      instance.updateSeats(data);
      console.log("Updated seats");
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
  }
}

let seatsClient = new SeatsClient(io());
