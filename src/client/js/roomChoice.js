class RoomChoiceClient {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    this._selectedRoom = null;

    let instance = this;
    if (document.getElementById("create-room-button") != null);
    document.getElementById("create-room-button").onclick = () => {
      this._socket.emit("createRoom", {});
    };
    if (document.getElementById("join-room-button") != null) {
      document.getElementById("join-room-button").onclick = () =>
        instance.joinRoom();
    }

    this._socket.on("roomId", (data) => instance.goToRoom(data));
    this._socket.on("roomCreatedOrUpdated", (data) => instance.addRoom(data));
    this._socket.emit("roomList", {});
  }
  goToRoom(data) {
    if (data.roomId != null) {
      window.location.href = `room/${data.roomId}`;
    }
  }
  addRoom(data) {
    console.log(
      `Received roomCreatedOrUpdated message with entries ${Object.entries(
        data
      )}`
    );
    console.log(`Adding room ${data.roomId}`);
    let list = document.getElementById("available-rooms-list");
    if (list == null || data.roomId == null) return;
    let room = new RoomElement(data);
    let instance = this;
    room.setOnClick(() => instance.selectRoom(room));
    this._rooms.push(room);
    list.appendChild(room.htmlElement);
  }

  selectRoom(room) {
    this._selectedRoom = room;
    for (let r of this._rooms) {
      r.deselect();
    }
    room.select();
  }
  joinRoom() {
    if (this._selectedRoom == null) return;
    let roomId = this._selectedRoom.roomId;
    this._socket.emit("joinRoom", { roomId: roomId });
  }
}

let socket = io({
  extraHeaders: {
    source: "ROOM_CHOICE",
  },
});
let roomChoiceClient = new RoomChoiceClient(socket);
