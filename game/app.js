#!/usr/bin/node

const express = require("express");
const http = require("http");
const path = require("path");
const { logger } = require("./logger");

class Server {
  constructor(port) {
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._SOCKET_CLIENTS = {};
    this._io = require("socket.io")(this._server, {});
    this._numberOfClients = 0;
    this._value = 0;
  }
  run() {
    this._app.get("/", function (req, res) {
      res.sendFile(path.join(__dirname, "client", "index.html"));
    });

    this._app.use("/client", express.static(path.join(__dirname, "client")));

    this._server.listen(this._port);

    this._io.sockets.on("connect", (socket) =>
      Server.clientConnect(socket, this)
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
    socket.emit("setValue", { value: instance._value });
    socket.on("setValue", (data) => Server.setValue(data, instance));
  }
  static setValue(data, instance) {
    instance._value = data.value;
    logger.info(`Got value ${data.value}`);
    Server.sendClients("setValue", { value: instance._value }, instance);
  }
  static sendClients(name, dict, instance) {
    for (const [key, value] of Object.entries(instance._SOCKET_CLIENTS)) {
      value.emit(name, dict);
      logger.info(`Sent value ${dict.value} to ${key}`);
    }
  }
}

let serv = new Server(8080);
logger.info("server is starting")
serv.run();
