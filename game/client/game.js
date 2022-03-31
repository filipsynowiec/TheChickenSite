class Game {
  constructor(socket, value) {
    this._value = value;
    this._socket = socket;
    console.log(this._socket);
    document.getElementById("incrementButton").onclick = () =>
      Game.incrementValue(this);
    if (document.getElementById("createRoomButton") != null)
      document.getElementById("createRoomButton").onclick = () => {
        this._socket.emit("createRoom", {});
      };
  }
  static incrementValue(instance) {
    instance._value++;
    let val = instance._value;
    instance._socket.emit("updateStatus", { eggValue: val });
  }
  getValue() {
    return this._value;
  }
  updateStatus(data) {
    this._value = data.eggValue;
    document.getElementById("value_par").innerHTML = this._value;
    console.log("Status updated");
  }
}
