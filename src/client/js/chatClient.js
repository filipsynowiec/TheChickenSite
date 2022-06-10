class ChatClient {
  constructor(socket) {
    this._socket = socket;
    this._socket.on("updateChat", (data) => {
      this.updateHTML("chat_history", data.chatHistory);
      console.log("Received chat history");
    });
    document.getElementById("send_message").onclick = () => {
      this.sendChatMessage();
    };
    getName(
      (name) => {
        this._name = name;
      },
      () => {
        this._name = "Guest User";
      }
    );
  }
  updateHTML(element, data) {
    document.getElementById(element).innerHTML = data;
  }
  sendChatMessage() {
    let mes = document.getElementById("message").value;
    let name = this._name;
    this._socket.emit("sendChatMessage", {
      name: name,
      value: mes,
    });
  }
}

let chatClient = new ChatClient(io());
