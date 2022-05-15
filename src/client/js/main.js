class Main {
  constructor(socket) {
    this._socket = socket;
    this._rooms = [];
    this._selectedRoom = null;
    console.log(this._socket);
    if (document.getElementById("create-room-button") != null)
      document.getElementById("create-room-button").onclick = () => {
        this._socket.emit("createRoom", {});
      };
    if (document.getElementById("join-room-button") != null) {
      document.getElementById("join-room-button").onclick = () =>
        Main.joinRoom(this);
    }
  }
  static joinRoom(instance) {
    if (instance._selectedRoom == null) {
      return;
    }
    let roomId = instance._selectedRoom.roomId;
    console.log(`Room id: ${roomId}`);
    instance._socket.emit("joinRoom", { roomId: roomId });
  }
  static selectRoom(instance, room) {
    instance._selectedRoom = room;
    for (let r of instance._rooms) {
      r.deselect();
    }
    room.select();
  }
  addRoom(data) {
    let list = document.getElementById("available-rooms-list");
    if (list == null) return;
    let room = new Room(data.roomId);
    room.setOnClick(() => Main.selectRoom(this, room));
    this._rooms.push(room);
    list.appendChild(room._htmlElement);
  }
}
