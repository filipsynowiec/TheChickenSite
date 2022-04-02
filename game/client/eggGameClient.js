class EggGameClient {
  constructor(socket) {
    this._value = 0;
    this._socket = socket;
    this._rooms = [];
    console.log(this._socket);
    this._socket.on("updateStatus", (data) =>
      EggGameClient.updateStatus(data.value, this)
    );
    this._socket.on("updateChat", (data) => {
      EggGameClient.updateHTML("chat_history", data.chatHistory);
      console.log("Received chat history");
    });
    this._socket.on("gameHTML", (data) => {
      EggGameClient.updateHTML("game_area", data.gameHTML);
      EggGameClient.startGame(instance);
      console.log("Received game html");
    });
    let instance = this;
    console.log(`instance from constructor: ${instance}`);
    document.getElementById("send_message").onclick = () => {
      EggGameClient.sendChatMessage(instance);
    };
  }
  static updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }

  static incrementValue(instance) {
    instance._value++;
    let val = instance._value;
    instance._socket.emit("updateStatus", { eggValue: val });
  }
  static joinRoom(instance) {
    var roomId = document.getElementById("roomList").value;
    if (roomId == null) return;
    console.log(`Room id: ${roomId}`);
    instance._socket.emit("joinRoom", { roomId: roomId });
  }
  getValue() {
    return this._value;
  }
  static updateStatus(data, instance) {
    instance._value = data;
    document.getElementById("value_par").innerHTML = instance._value;
    console.log("Status updated");
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
  static startGame(instance) {
    instance._initializedGame = true;
    document.getElementById("incrementButton").onclick = () =>
      EggGameClient.incrementValue(this);
  }
  static sendChatMessage(instance) {
    let mes = document.getElementById("message").value;
    let name = instance._name;
    instance._socket.emit("sendChatMessage", {
      name: name,
      value: mes,
    });
    console.log(`Sending message ${mes} with name ${name}`);
  }
}

let socket = io();
let client = new EggGameClient(socket);
