#!/usr/bin/node

const express = require("express");
const http = require("http");
const path = require("path");
const { logger } = require("./logger");
const fs = require("fs");
const randomstring = require("randomstring");
const child_process = require("child_process");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");
const { isObject } = require("util");
class Server {
  constructor(port) {
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._SOCKET_CLIENTS = {};
    this._ROOMS = {};
    this._io = require("socket.io")(this._server, {});
    this._numberOfClients = 0;
    this._URL = "http://127.0.0.1:" + port + "/";
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
  /* Cuts roomId from given url of room page */
  getSubpageIdFromURL(url) {
    return url.substring(this._URL.length, this._URL.lastIndex);
  }
  /* Connects client socket to both socket.room and room */
  handleConnection(roomId, client) {
    this._SOCKET_CLIENTS[client].join(roomId);

    if (this._ROOMS[roomId] != null) {
      Server.sendChild(
        this._ROOMS[roomId],
        new RoomRequest(client, RoomRequestType.Join, {})
      );
    }
  }
  /* Emits a message to given room */
  sendToRoom(name, data, roomId) {
    let ret = this._io.to(roomId).emit(name, data);
    if (ret === false) {
      logger.info(`Message failed`);
    } else {
      logger.info(
        `Message sent to room ${roomId} with name ${name} and data ${Object.entries(
          data
        )}`
      );
    }
  }
  /* Function invoked when client connects to page */
  static clientConnect(socket, instance) {
    let socketId = socket.id;
    instance._numberOfClients++;
    instance._SOCKET_CLIENTS[socketId] = socket;
    socket.on("createRoom", (socket) =>
      Server.createRoom(socket, instance, socketId)
    );
    socket.on("updateStatus", (data) =>
      Server.updateStatus(data, instance, socketId)
    );
    socket.on("joinRoom", (data) =>
      Server.joinRoom(data.roomId, instance, socketId)
    );
    socket.on("sendChatMessage", (data) =>
      Server.sendChatMessage(data, instance, socketId)
    );
    socket.on("clientReady", (data) => Server.sendClientReady(data, instance, socketId));
    let roomId = instance.getSubpageIdFromURL(socket.handshake.headers.referer);
    logger.info(
      `Client ${socketId} connected to ${roomId != "" ? roomId : "/"}`
    );
    /* if client connected to certain room -> handle the connection */
    if (roomId != "") {
      instance.handleConnection(roomId, socketId);
    }

    Server.sendRoomList(instance, socketId);
  }
  /* Function invoked when client udpates the status of the game */
  static updateStatus(data, instance, socketId) {
    let roomId = instance.getSubpageIdFromURL(
      instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.Update, data)
    );
  }
  static sendClientReady(data, instance, socketId) {
    let roomId = instance.getSubpageIdFromURL(
      instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.ClientReady, data)
    );
  }
  static sendChatMessage(data, instance, socketId) {
    let roomId = instance.getSubpageIdFromURL(
      instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendChatMessage, data)
    );
  }
  /* Emits message to certain socket client */
  static sendClient(name, data, socketId, instance) {
    logger.info(`${socketId} wants to join`);
    instance._SOCKET_CLIENTS[socketId].emit(name, data);
  }
  /* Emits message to all socket clients */
  static sendToAllClients(name, data, instance) {
    instance._io.emit(name, data);
  }
  static sendRoomList(instance, socketId) {
    Server.sendClient(
      "getRoomList",
      { roomList: instance._ROOMS },
      socketId,
      instance
    );
  }
  /* Creates room and redirects client to its page */
  static createRoom(socket, instance, socketId) {
    let roomId = randomstring.generate(8);
    let childProcess = child_process.fork("./room.js", {
      detached: false,
    });
    childProcess.on("message", (msg) =>
      Server.receiveMessageFromChild(msg, roomId, instance)
    );
    instance._ROOMS[roomId] = childProcess;
    logger.info(`Room ${roomId} created`);
    Server.sendChild(
      childProcess,
      new RoomRequest(null, RoomRequestType.SetGame, {})
    );
    Server.joinRoom(roomId, instance, socketId);
    logger.info("sending to all clients");
    Server.sendToAllClients("newRoomCreated", { roomId: roomId }, instance);
    logger.info("sent to all clients");
  }
  static joinRoom(roomId, instance, socketId) {
    instance._app.get("/" + roomId, function (req, res) {
      res.sendFile(path.join(__dirname, "client", "room.html"));
    });
    Server.sendClient("roomId", { roomId: roomId }, socketId, instance);
  }
  /* Receives message from room and propagates it to all clients connected to that room */
  static receiveMessageFromChild(msg, roomId, instance) {
    let message = new RoomMessage(null, null, msg);
    switch (message.getType()) {
      case RoomMessageType.Send:
        instance.sendToRoom("updateStatus", message.getData(), roomId);
        break;
      case RoomMessageType.SendHTML:
        instance.sendToRoom(
          "gameHTML",
          { gameHTML: message.getData().gameHTML },
          message.getData().client
        );
        break;
      case RoomMessageType.ChatHistory:
        instance.sendToRoom("updateChat", message.getData(), roomId);
    }
  }
  /* Sends a request to certain room */
  static sendChild(childProcess, request) {
    let ret = childProcess.send(request);
    if (ret === false) {
      logger.info("Send failed");
    }
  }
}

let serv = new Server(8080);
logger.info("Server is starting");
serv.run();
