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
    console.log(`Redirecting to 127.0.0.1:8080/room/${data.roomId}`);
    window.location.href = `room/${data.roomId}`;
  }
  static addRoomList(data, instance) {
    console.log(Object.entries(data));
    for (let room of data.roomList) {
      Client.addSingleRoom({ roomId: room }, instance);
    }
  }
  static addSingleRoom(data, instance) {
    console.log(`New room was created with id: ${data.roomId}`);
    instance._main.addRoom(data);
  }
}

let socket = io({
  extraHeaders: {
    source: "ROOM_CHOICE",
  },
});
let client = new Client(socket);
