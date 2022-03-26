#!/usr/bin/node

const { Console } = require("console");
const express = require("express");
const http = require("http");

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
      res.sendFile(__dirname + "/client/index.html");
    });

    this._app.use("/client", express.static(__dirname + "/client"));

    this._server.listen(this._port);

    this._io.sockets.on("connect", (socket) =>
      Server.clientConnect(socket, this)
    );
  }

  static clientConnect(socket, instance) {
    let socketId = instance._numberOfClients;
    instance._numberOfClients++;
    instance._SOCKET_CLIENTS[socketId] = socket;
    console.log(`Connected ${socketId}`);
    socket.emit("setId", {
      id: socketId,
    });
    socket.emit("setValue", { value: instance._value });
    socket.on("setValue", (data) => Server.setValue(data, instance));
  }
  static setValue(data, instance) {
    instance._value = data.value;
    console.log(`Got ${data.value}`);
    Server.sendClients("setValue", { value: instance._value }, instance);
  }
  static sendClients(name, dict, instance) {
    for (const [key, value] of Object.entries(instance._SOCKET_CLIENTS)) {
      value.emit(name, dict);
      console.log(`Sent ${dict.value} to ${key}`);
    }
  }
}

let serv = new Server(8080);
serv.run();
