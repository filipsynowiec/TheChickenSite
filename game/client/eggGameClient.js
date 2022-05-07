class EggGameClient {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    console.log(this._socket);
    this._socket.on("updateStatus", (data) =>
      EggGameClient.updateStatus(data.eggValue, this)
    );
    this._socket.on("updateChat", (data) => {
      EggGameClient.updateHTML("chat_history", data.chatHistory);
      console.log("Received chat history");
    });
    this._socket.on("gameHTML", (data) => {
      EggGameClient.updateHTML("game-area", data.gameHTML);
      EggGameClient.sendClientReady(instance);
      instance.startGame(instance);
      console.log("Received game html");
    });
    let instance = this;
    this._socket.on("updateStatus", (data) =>
      instance.updateStatus(data.eggValue)
    );
    this._socket.on("gameHTML", (data) => {
      instance.updateHTML("game_area", data.gameHTML);
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

let client = new EggGameClient(io());
