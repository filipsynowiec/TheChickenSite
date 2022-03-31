
class Game {
  constructor(socket, value) {
    this._value = value;
    this._socket = socket;
    this._rooms = []
    console.log(this._socket);
    document.getElementById("incrementButton").onclick = () =>
      Game.incrementValue(this);
    if (document.getElementById("createRoomButton") != null)
      document.getElementById("createRoomButton").onclick = () => {
        this._socket.emit("createRoom", {});
      };
    if (document.getElementById("createRoomButton") != null) {
      document.getElementById("joinRoomButton").onclick = () =>
        Game.joinRoom(this);
    };
  }
  static incrementValue(instance) {
    instance._value++;
    let val = instance._value;
    instance._socket.emit("updateStatus", { eggValue: val });
  }
  static joinRoom(instance) {
    var roomId = document.getElementById("roomList").value
    if (roomId == null) return
    console.log(`Room id: ${roomId}`)
    instance._socket.emit("joinRoom", {roomId: roomId})
  }
  getValue() {
    return this._value;
  }
  updateStatus(data) {
    this._value = data.eggValue;
    document.getElementById("value_par").innerHTML = this._value;
    console.log("Status updated");
  }
  addRoom(data) {
    console.log("adding new room")
    this._rooms.push(data.roomId)
    var select = document.getElementById("roomList");
    if (select == null) return
    var option = document.createElement("option")
    option.value = data.roomId
    option.innerHTML = data.roomId
    select.appendChild(option);
  }
}
