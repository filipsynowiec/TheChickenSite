class EggGameClient {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    console.log(this._socket);
    let instance = this;

    document.getElementById("leave-room").innerHTML =
      '<a class="nav-link nav-link-left" href="../rooms?game=EGG-GAME">Leave room</a>';

    this._socket.on("updateStatus", (data) =>
      instance.updateStatus(data.eggValue)
    );
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
    document.getElementById("value_par").innerHTML = data;
  }
  startGame(instance) {
    document.getElementById("incrementButton").onclick = () =>
      instance.incrementValue(this);
  }
  sendClientReady(instance) {
    instance._socket.emit("clientReady", {});
    console.log(`Sending client ready`);
  }
}

const client = new EggGameClient(getIO());