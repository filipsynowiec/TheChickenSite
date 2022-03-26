class Client {
  constructor(name, socket) {
    this._name = name;
    this._socket = socket;
    this._game = new Game(this._socket, 0);
    this._socket.on("setId", function (data) {
      this._id = data.id;
      console.log(`Got id: ${this._id}`);
    });
    this._socket.on("setValue", (data) => Client.execute(data, this));
  }
  static execute(data, instance) {
    instance._game.setValue(data.value);
  }
}

let socket = io();
let name = prompt("Give name");
let client = new Client(name, socket);
