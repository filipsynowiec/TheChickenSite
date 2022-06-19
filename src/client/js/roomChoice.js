let csloggerRoomChoice = new CSLogger("RoomChoiceClient");

class RoomChoiceClient {
  constructor(socket) {
    this._socket = socket;
    this._roomsById = {};
    this._selectedRoom = null;

    const url = new URL(window.location.href);
    this._game = url.searchParams.get("game");
    csloggerRoomChoice.info(`Selected game: ${this._game}`);

    let instance = this;
    if (document.getElementById("create-room-button") != null);
    document.getElementById("create-room-button").onclick = () => {
      this._socket.emit("createRoom", {});
    };
    if (document.getElementById("join-room-button") != null) {
      document.getElementById("join-room-button").onclick = () =>
        instance.joinRoom();
    }

    this._socket.on("signInRequired", (data) => instance.goToSignIn(data));
    this._socket.on("roomId", (data) => instance.goToRoom(data));
    this._socket.on("roomCreatedOrUpdated", (data) =>
      instance.addOrUpdateRoom(data)
    );
    this._socket.emit("roomList", {});
  }
  goToSignIn(data) {
    window.location.href = `signin`;
  }

  goToRoom(data) {
    if (data.roomId != null) {
      window.location.href = `room/${data.roomId}`;
    }
  }
  addOrUpdateRoom(data) {
    if (data.gameName != this._game) return;

    csloggerRoomChoice.info(
      `Received roomCreatedOrUpdated message with entries ${Object.entries(
        data
      )}`
    );
    csloggerRoomChoice.info(`Adding room ${data.roomId}`);
    let list = document.getElementById("available-rooms-list");
    if (list == null || data.roomId == null) return;
    let room = new RoomElement(data);
    let instance = this;
    room.setOnClick(() => instance.selectRoom(room));

    // replace element if it is only an update
    if (!this._roomsById[data.roomId]) {
      list.appendChild(room.htmlElement);
    } else {
      list.replaceChild(
        room.htmlElement,
        this._roomsById[data.roomId].htmlElement
      );
    }
    this._roomsById[data.roomId] = room;
  }

  selectRoom(room) {
    this._selectedRoom = room;
    for (let [_, r] of Object.entries(this._roomsById)) {
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

socket.emit = (function (emitter) {
  return function () {
    const token = localStorage.getItem("token");
    if (token) {
      arguments[1].token = token;
    }
    return emitter.apply(this, arguments);
  };
})(socket.emit);
let roomChoiceClient = new RoomChoiceClient(socket);
