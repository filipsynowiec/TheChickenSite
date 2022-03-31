
class Client {
  constructor(socket) {
    this._socket = socket;
    this._game = new Game(this._socket, 0);
    this._socket.on("roomId", (data) => Client.goToRoom(data, this));
    this._socket.on("updateStatus", (data) => Client.execute(data, this));
  }
  static execute(data, instance) {
    instance._game.updateStatus(data);
  }
  static goToRoom(data, instance) {
    console.log(`Redirecting to 127.0.0.1:8080/${data.roomId}`);
    window.location.replace(`${data.roomId}`);
  }
}

let socket = io();
let client = new Client(socket);
