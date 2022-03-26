class Game {
  constructor(socket, value) {
    this._value = value;
    this._socket = socket;
    console.log(this._socket);
    document.getElementById("incrementButton").onclick = () =>
      Game.incrementValue(this);
  }
  static incrementValue(instance) {
    instance._value++;
    let val = instance._value;
    instance._socket.emit("setValue", { value: val });
  }
  getValue() {
    return this._value;
  }
  setValue(value) {
    this._value = value;
    document.getElementById("value_par").innerHTML = this._value;
  }
}
