class RoomClient {
  constructor(name, socket) {
    this._name = name;
    this._socket = socket;
    this._socket.on("setId", function (data) {
      this._id = data.id;
      console.log(`Got id: ${this._id}`);
    });
    this._socket.on("chatHistory", (data) => {
      RoomClient.execute(data, this);
      console.log("Received chat history");
    });
    let instance = this;
    console.log(`instance from constructor: ${instance}`);
    document.getElementById("send_message").onclick = () => {
      RoomClient.sendMessage(instance);
    };
  }

  static sendMessage(instance) {
    let mes = document.getElementById("message").value;
    let name = instance._name;
    instance._socket.emit("sendMessage", {
      name: name,
      value: mes,
    });
    console.log(`Sending message ${mes} with name ${name}`);
  }

  static execute(data, instance) {
    document.getElementById("chat_history").innerHTML = data.history;
  }
}

let socket = io();
let name = prompt("Give name");
let client = new RoomClient(name, socket);
