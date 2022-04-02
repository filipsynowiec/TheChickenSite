class Client {
  constructor(socket) {
    this._socket = socket;
    this._main = new Main(this._socket);
    this._socket.on("roomId", (data) => Client.goToRoom(data, this));
    this._socket.on("newRoomCreated", (data) =>
      Client.addSingleRoom(data, this)
    );
    this._socket.on("getRoomList", (data) => Client.addRoomList(data, this));
  }
  static goToRoom(data, instance) {
    console.log(`Redirecting to 127.0.0.1:8080/${data.roomId}`);
    window.location.replace(`${data.roomId}`);
  }
  static addRoomList(data, instance) {
    console.log(Object.entries(data));
    for (const [key, value] of Object.entries(data.roomList)) {
      Client.addSingleRoom({ roomId: key }, instance);
    }
  }
  static addSingleRoom(data, instance) {
    console.log(`New room was created with id: ${data.roomId}`);
    instance._main.addRoom(data);
  }
}

let socket = io();
let client = new Client(socket);
