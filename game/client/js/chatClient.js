class ChatClient {
  constructor(socket) {
    this._socket = socket;
    this._socket.on("updateChat", (data) => {
      ChatClient.updateHTML("chat_history", data.chatHistory);
      console.log("Received chat history");
    });
    let instance = this;
    document.getElementById("send_message").onclick = () => {
      ChatClient.sendChatMessage(instance);
    };
    getName(
      (name) => {
        instance._name = name;
      },
      () => {
        instance._name = "Guest User";
      }
    );
  }
  static updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  static sendChatMessage(instance) {
    let mes = document.getElementById("message").value;
    let name = instance._name;
    instance._socket.emit("sendChatMessage", {
      name: name,
      value: mes,
    });
  }
}

let chatClient = new ChatClient(io());