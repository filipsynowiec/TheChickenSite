class ChatClient {
  constructor(socket) {
    this._socket = socket;
    let instance = this;
    this._socket.on("updateChat", (data) => {
      instance.updateHTML("chat-history", data.chatHistory);
      console.log("Received chat history");
    });
    getUserData().then((data) => {
      instance._name = data.name;
    });
    document.getElementById("message").onkeydown = (event) => {
      if (event.key === "Enter") instance.sendChatMessage();
    };
    document.getElementById("send-message").onclick = () => {
      instance.sendChatMessage();
    };
  }
  updateHTML(element, data) {
    let template = document.getElementById("chat-row-template");
    document.getElementById(element).innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      let textUsername = htmlElement.querySelector(".chat-text-username");
      let textMessage = htmlElement.querySelector(".chat-text-message");
      textUsername.innerHTML = `${data[i].user}:`;
      textMessage.innerHTML = ` ${data[i].message}`;
      document.getElementById(element).appendChild(htmlElement);
    }
  }
  sendChatMessage(instance) {
    let mes = document.getElementById("message").value;
    document.getElementById("message").value = null;
    let element = document.getElementById("chat-history");
    element.scrollTop = element.scrollHeight;
    let name = this._name;
    this._socket.emit("sendChatMessage", {
      name: name,
      value: mes,
    });
  }
}

let chatClient = new ChatClient(getIO());
