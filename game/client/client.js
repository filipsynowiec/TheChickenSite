
class Client {
  constructor(socket) {
    this._socket = socket;
    this._game = new Game(this._socket, 0);
    this._socket.on("roomId", (data) => Client.goToRoom(data, this));
    this._socket.on("updateStatus", (data) => Client.execute(data, this));
    this._socket.on("newRoomCreated", (data) => Client.addSingleRoom(data, this));
    this._socket.on("getRoomList", (data) => Client.addRoomList(data, this));
  }
  static execute(data, instance) {
    instance._game.updateStatus(data);
  }
  static goToRoom(data, instance) {
    console.log(`Redirecting to 127.0.0.1:8080/${data.roomId}`);
    window.location.replace(`${data.roomId}`);
  }
  static addRoomList(data, instance) {
    console.log(Object.entries(data))
    for (const [key, value] of Object.entries(data.roomList)) {
      Client.addSingleRoom({roomId: key}, instance)
    }
  }
  static addSingleRoom(data, instance) {
    console.log(`New room was created with id: ${data.roomId}`);
    instance._game.addRoom(data)
  }
}

let socket = io();
let client = new Client(socket);
