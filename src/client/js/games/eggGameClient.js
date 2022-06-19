let csloggerEggGame = new CSLogger("EggGameClient");

class EggGameClient {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    csloggerEggGame.info(this._socket);
    let instance = this;

    getUserData().then((data) => {
      instance._name = data.name;
    });

    document.getElementById("leave-room").innerHTML =
      '<a class="nav-link nav-link-left" href="../rooms?game=EGG-GAME">Leave room</a>';

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
  incrementValue(instance) {
    instance._socket.emit("requestAction", { increment: true });
  }
  updateStatus(data) {
    this._resultField.innerText = data.eggValue;
    this._incrementButton.disabled =
      !(data.running && data.allowed.includes(this._name));

  }
  startGame(instance) {
    this._incrementButton = document.getElementById("incrementButton");
    this._resultField = document.getElementById("value_par");
    this._incrementButton.onclick = () =>
      instance.incrementValue(this);
    this._incrementButton.disabled = true;
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    csloggerEggGame.info(`Sending client ready`);
  }
}

const client = new EggGameClient(getIO());
