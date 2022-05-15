#!/usr/bin/node

const express = require("express");
const http = require("http");
const path = require("path");
const { logger } = require("./server/logger");
const fs = require("fs");
const randomstring = require("randomstring");
const child_process = require("child_process");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./server/roomRequests");
const { GameChoiceManager } = require("./server/gameChoiceManager");
const { RoomChoiceManager } = require("./server/roomChoiceManager");
const bodyParser = require("body-parser");
const cors = require("cors");
let corsOptions = {
  origin: "http://localhost:8081",
};

class Server {
  constructor(port) {
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._SOCKET_CLIENTS = {};
    this._ROOMS = {};
    this._io = require("socket.io")(this._server, {});
    this._db = require("./models");
    this._numberOfClients = 0;
    this._URL = "http://127.0.0.1:" + port + "/";
    this._ROOM_URL_LENGTH = 8;
    this._gameChoiceManager = new GameChoiceManager();
    this._roomChoiceManager = new RoomChoiceManager();
  }
  run() {
    this._gameChoiceManager.loadGamesJSON();
    this._roomChoiceManager.setGames(this._gameChoiceManager.games);
    // routes

    this._app.use(cors(corsOptions));
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));

    require("./routes/auth.routes")(this._app);
    require("./routes/user.routes")(this._app);

    this._app.get("/", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "index.html"));
    });
    this._app.get("/games", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "gameChoice.html"));
    });
    this._app.get("/rooms", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "chooseRoom.html"));
    });
    this._app.use("/client", express.static(path.join(__dirname, "client")));
    this._app.use("/public", express.static(path.join(__dirname, "public")));
    this._app.get("/api/auth/signup", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "registerForm.html"));
    });
    this._app.get("/api/auth/signin", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "loginForm.html"));
    });
    this._app.get("/api/test", function (req, res) {
      res.sendFile(path.join(__dirname, "client/html", "roleTest.html"));
    });

    this._server.listen(this._port);

    const instance = this;
    this._db.sequelize.sync({ force: true }).then(() => {
      logger.info("Drop and resync database");
      this.initial();
    });

    this._io.sockets.on("connect", (socket) =>
      Server.clientConnect(socket, this)
    );
  }
  /* for database */
  initial() {
    let Role = this._db.role;
    Role.create({
      id: 1,
      name: "admin",
    });

    Role.create({
      id: 2,
      name: "moderator",
    });

    Role.create({
      id: 3,
      name: "user",
    });
  }

  /* Cuts relative adress from given url */
  getRelativeURL(url) {
    return url.substring(this._URL.length, this._URL.lastIndex);
  }
  /* Cuts room id from relativer adress*/
  getRoomIdFromRelative(url) {
    return url.substring(url.length - this._ROOM_URL_LENGTH);
  }
  /* Connects client socket to both socket.room and room */
  handleConnection(roomId, client) {
    this._SOCKET_CLIENTS[client].join(roomId);
    logger.info(this._ROOMS[roomId]);
    Server.sendChild(
      this._ROOMS[roomId],
      new RoomRequest(client, RoomRequestType.Join, {})
    );
    logger.info(`Told room ${roomId} to add ${client}`);
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
    if (socket.handshake.headers.source == "GAME_CHOICE") {
      instance._gameChoiceManager.manage(socket);
      return;
    }
    if (socket.handshake.headers.source == "ROOM_CHOICE") {
      instance._roomChoiceManager.manage(socket);
    }
    let socketId = socket.id;
    instance._numberOfClients++;
    instance._SOCKET_CLIENTS[socketId] = socket;
    logger.info(`Params ---->>> ${socket.handshake.query.param}`);
    socket.on("createRoom", (socket) =>
      Server.createRoom(socket, instance, socketId)
    );
    socket.on("requestAction", (data) =>
      Server.updateStatus(data, instance, socketId)
    );
    socket.on("joinRoom", (data) =>
      Server.joinRoom(data.roomId, instance, socketId)
    );
    socket.on("sendChatMessage", (data) =>
      Server.sendChatMessage(data, instance, socketId)
    );
    socket.on("sendSeatClaim", (data) =>
      Server.sendSeatClaim(data, instance, socketId)
    );
    socket.on("clientReady", (data) =>
      Server.sendClientReady(data, instance, socketId)
    );
    let relative_url = instance
      .getRelativeURL(socket.handshake.headers.referer)
      .substring();
    let roomId = instance.getRoomIdFromRelative(relative_url);
    logger.info(`Client ${socketId} connected to ${relative_url}`);
    /* if client connected to certain room -> handle the connection */
    if (instance._ROOMS[roomId] != null) {
      instance.handleConnection(roomId, socketId);
    }
  }
  /* Function invoked when client udpates the status of the game */
  static updateStatus(data, instance, socketId) {
    let roomId = instance.getRoomIdFromRelative(
      instance.getRelativeURL(
        instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
      )
    );
    9;
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.Update, data)
    );
  }
  static sendClientReady(data, instance, socketId) {
    let roomId = instance.getRoomIdFromRelative(
      instance.getRelativeURL(
        instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
      )
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.ClientReady, data)
    );
  }
  static sendChatMessage(data, instance, socketId) {
    let roomId = instance.getRoomIdFromRelative(
      instance.getRelativeURL(
        instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
      )
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendChatMessage, data)
    );
  }

  static sendSeatClaim(data, instance, socketId) {
    let roomId = instance.getRoomIdFromRelative(
      instance.getRelativeURL(
        instance._SOCKET_CLIENTS[socketId].handshake.headers.referer
      )
    );
    Server.sendChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendSeatClaim, data)
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

  /* Creates room and redirects client to its page */
  static createRoom(socket, instance, socketId) {
    let roomId = randomstring.generate(instance._ROOM_URL_LENGTH);
    let game = RoomChoiceManager.getGameFromSocket(
      instance._SOCKET_CLIENTS[socketId]
    );
    let childProcess = child_process.fork("./server/room.js", {
      detached: false,
    });
    childProcess.on("message", (msg) =>
      Server.receiveMessageFromChild(msg, roomId, instance)
    );
    instance._ROOMS[roomId] = childProcess;
    instance._roomChoiceManager.addRoom(roomId, game);
    logger.info(`Room ${roomId} created with process ${childProcess.pid}`);
    Server.sendChild(
      childProcess,
      new RoomRequest(null, RoomRequestType.SetGame, { game: game })
    );
    Server.joinRoom(roomId, instance, socketId);
    Server.sendToAllClients("newRoomCreated", { roomId: roomId }, instance);
  }
  static joinRoom(roomId, instance, socketId) {
    let game = RoomChoiceManager.getGameFromSocket(
      instance._SOCKET_CLIENTS[socketId]
    );
    instance._app.get("/room/" + roomId, function (req, res) {
      fs.readFile("client/html/room.html", "utf8", (err, data) => {
        if (err) {
          logger.error(err);
          return;
        }
        switch (game) {
          case "EGG_GAME":
            data = data.replace(
              "<!--__GAME_SCRIPT__-->",
              '<script src="/client/js/eggGameClient.js"></script>'
            );
            break;
          case "TICK_TACK_TOE":
            data = data.replace(
              "<!--__GAME_SCRIPT__-->",
              '<script src="/client/js/tickTackToeClient.js"></script>'
            );
            break;
          default:
            logger.error(`No such game! - ${game}`);
            return;
        }
        res.send(data);
      });
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
        break;
      case RoomMessageType.Seats:
        instance.sendToRoom("updateSeats", message.getData(), roomId);
        break;
      default:
          logger.error(`No such message type! - ${message.getType()}`);
          return;
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
