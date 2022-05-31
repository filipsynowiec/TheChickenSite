class ChatClient {
  constructor(socket) {
    this._socket = socket;
    let instance = this;
    this._socket.on("updateChat", (data) => {
      instance.updateHTML("chat_history", data.chatHistory);
      console.log("Received chat history");
    });
    document.getElementById("send_message").onclick = () => {
      instance.sendChatMessage();
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
  updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  sendChatMessage() {
    let mes = document.getElementById("message").value;
    let name = instance._name;
    this._socket.emit("sendChatMessage", {
      name: name,
      value: mes,
    });
  }
}

let chatClient = new ChatClient(io());
