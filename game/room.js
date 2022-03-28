#!/usr/bin/node

const express = require("express");
const http = require("http");
const path = require("path");
const { logger } = require("./logger");
const { Chat } = require("./chat");

class Room {
  constructor(port) {
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._SOCKET_CLIENTS = {};
    this._io = require("socket.io")(this._server, {});
    this._numberOfClients = 0;
    this._chat = new Chat("Chat history:\n");
    this._chat.registerObserver(this);
  }

  update() {
    Room.sendClients("chatHistory", { history: this._chat.history }, this);
  }

  run() {
    this._app.get("/", function (req, res) {
      res.sendFile(path.join(__dirname, "client", "room.html"));
    });

    this._app.use("/client", express.static(path.join(__dirname, "client")));

    this._server.listen(this._port);

    this._io.sockets.on("connect", (socket) =>
      Room.clientConnect(socket, this)
    );
  }

  static clientConnect(socket, instance) {
    let socketId = instance._numberOfClients;
    instance._numberOfClients++;
    instance._SOCKET_CLIENTS[socketId] = socket;
    logger.info(`Connection established, giving id ${socketId}`);
    socket.emit("setId", {
      id: socketId,
    });
    socket.on("sendMessage", (data) =>
      instance._chat.registerMessage(data, instance._chat)
    );
    socket.emit("chatHistory", { history: instance._chat.history });
  }

  static sendClients(name, dict, instance) {
    for (const [key, value] of Object.entries(instance._SOCKET_CLIENTS)) {
      value.emit(name, dict);
      logger.info(`Sent value ${dict} to ${key}`);
    }
  }
}

let serv = new Room(8080);
logger.info("server is starting");
serv.run();
