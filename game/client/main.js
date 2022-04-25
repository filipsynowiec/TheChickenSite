class Main {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    console.log(this._socket);
    if (document.getElementById("createRoomButton") != null)
      document.getElementById("createRoomButton").onclick = () => {
        this._socket.emit("createRoom", {});
      };
    if (document.getElementById("createRoomButton") != null) {
      document.getElementById("joinRoomButton").onclick = () =>
        Main.joinRoom(this);
    }
  }
  static joinRoom(instance) {
    var roomId = document.getElementById("roomList").value;
    if (roomId == null) return;
    console.log(`Room id: ${roomId}`);
    instance._socket.emit("joinRoom", { roomId: roomId });
  }
  addRoom(data) {
    console.log("adding new room");
    this._rooms.push(data.roomId);
    var select = document.getElementById("roomList");
    if (select == null) return;
    var option = document.createElement("option");
    option.value = data.roomId;
    option.innerHTML = data.roomId;
    select.appendChild(option);
  }
}
