const { logger } = require("../../utils/logger");
const { ServerUtils } = require("../../utils/serverUtils");
const { RoomManager } = require("./roomManager");
const { GameChoiceManager } = require("./gameChoiceManager");
const { RoomChoiceManager } = require("./roomChoiceManager");
const fs = require("fs");
const path = require("path");
const randomstring = require("randomstring");
const child_process = require("child_process");
const constants = require("../../utils/constants");
const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config");
const { RoomSocketManager } = require("../room/socketIdManager");
const queries = require("../../database/dbQueries");

class ClientManager {
  constructor(server, path) {
    this._io = require("socket.io")(server, {});
    this._numberOfClients = 0;
    this._SOCKET_CLIENTS = {}; // stores sockets of all clients
    this._ROOMS = {}; // stores child processes
    this._gameChoiceManager = new GameChoiceManager();
    this._roomChoiceManager = new RoomChoiceManager();
    this._gameChoiceManager.loadGamesJSON();
    this._roomChoiceManager.setGames(this._gameChoiceManager.games);
    this._basepath = path;
  }

  registerRoomRoute(app, game) {
    let instance = this;
    app.get("/room/:roomId", function (req, res) {
      if (instance._ROOMS[req.params.roomId] == undefined) {
        res.sendFile(
          path.join(instance._basepath, "src/client/html", "index.html")
        );
      } else {
        fs.readFile("src/client/html/room.html", "utf8", (err, data) => {
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
      }
    });
  }

  setHandlers(app) {
    this._io.sockets.on("connect", (socket) => this.clientConnect(socket, app));
  }

  /* Function invoked when client connects to page */
  clientConnect(socket, app) {
    if (socket.handshake.headers.source == "GAME_CHOICE") {
      this._gameChoiceManager.manage(socket);
      return;
    }
    if (socket.handshake.headers.source == "ROOM_CHOICE") {
      this._roomChoiceManager.manage(socket);
    }
    let socketId = socket.id;
    this._numberOfClients++;
    this._SOCKET_CLIENTS[socketId] = socket;

    this.setRequestMethods(socket, app);

    let relative_url = ServerUtils.getRelativeURL(
      socket.handshake.headers.referer
    ).substring();
    let roomId = ServerUtils.getRoomIdFromRelative(relative_url);

    logger.info(`Client ${socketId} connected to ${relative_url}`);
    /* if client connected to certain room -> handle the connection */
    if (this._ROOMS[roomId] != null) {
      this.handleConnection(roomId, socketId);
      socket.on("disconnect", () => {
        this.clientDisconnect(socketId, roomId);
      });
    }
  }
  clientDisconnect(socketId, roomId) {
    RoomManager.removeClientFromRoom(this._ROOMS[roomId], socketId);
    delete this._SOCKET_CLIENTS[socketId];
  }
  /* Connects client socket to both socket.room and room */
  handleConnection(roomId, client) {
    this._SOCKET_CLIENTS[client].join(roomId);
    logger.info(this._ROOMS[roomId]);
    RoomManager.connectNewClientToRoom(this._ROOMS[roomId], client);
    logger.info(`Told room ${roomId} to add ${client}`);
  }

  /* Emits message to certain socket client */
  sendToOneClient(name, data, socketId) {
    logger.info(`${socketId} wants to join`);
    this._SOCKET_CLIENTS[socketId].emit(name, data);
  }
  /* Emits message to all socket clients */
  sendToAllClients(name, data) {
    this._io.emit(name, data);
  }

  /* Emits a message to given room */
  sendToClientsInRoom(name, data, roomId) {
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

  setRequestMethods(socket, app) {
    let socketId = socket.id;
    socket.on("createRoom", (data) => {
      let roomId = randomstring.generate(constants.ROOM_URL_LENGTH);
      let game = RoomChoiceManager.getGameFromSocket(
        this._SOCKET_CLIENTS[socketId]
      );
      let childProcess = child_process.fork("./src/server/room/room.js", {
        detached: false,
      });
      childProcess.on("message", (msg) => {
        let receivedMessage = RoomManager.receiveMessageFromRoom(msg, roomId);
        
        logger.info(
          `Received message from room with keys ${Object.keys(
            receivedMessage
          )}, ${Object.keys(receivedMessage.data)}`
        );
        // case for kill requests
        if (receivedMessage.name == "killRequest") {
          this.killRoom(roomId);
        }
        // a BIG case for userIds message
        else if (receivedMessage.name === "userIds") {
          logger.info("Received userIds message");
          receivedMessage.data.roomId = roomId;
          let instance = this;
          queries
            .getGameRankings(
              receivedMessage.data.userIds,
              receivedMessage.data.gameName
            )
            .then((results) => {
              receivedMessage.data.results = results;
              instance.sendToAllClients(
                "roomCreatedOrUpdated",
                receivedMessage.data,
                receivedMessage.roomId
              );
            });
        }
        // and all the other messages
        else {
          this.sendToClientsInRoom(
            receivedMessage.name,
            receivedMessage.data,
            receivedMessage.roomId
          );
        }
      });

      this._ROOMS[roomId] = childProcess;
      this._roomChoiceManager.addRoom(roomId, game);

      this.registerRoomRoute(app, game);
      RoomManager.createRoom(app, childProcess, roomId, game);

      this.sendToOneClient("roomId", { roomId: roomId }, socketId);

      // unnecessary as of right now - player who created room
      // joins it immediately and therefore sends another
      // message with this room
      /*
      this.sendToAllClients("roomCreatedOrUpdated", {
        roomId: roomId,
        players: [],
      });
      */
    });

    socket.on("requestAction", (data) => {
      logger.info(`Received request action, data: ${Object.entries(data)}`);
      data = ClientManager.preprocessData(data);
      if (!data) return;
      RoomManager.updateStatus(
        data,
        this,
        socketId,
        this.getRoomIdFromSocketId(socketId)
      );
    });

    socket.on("joinRoom", (data) => {
      let game = RoomChoiceManager.getGameFromSocket(
        this._SOCKET_CLIENTS[socketId]
      );
      data = ClientManager.preprocessData(data);
      if (!data) return;
      this.sendToOneClient("roomId", { roomId: data.roomId }, socketId);
    });

    socket.on("sendChatMessage", (data) => {
      data = ClientManager.preprocessData(data);
      if (!data) return;
      RoomManager.sendChatMessage(
        data,
        this,
        socketId,
        this.getRoomIdFromSocketId(socketId)
      );
    });

    socket.on("clientReady", (data) => {
      data = ClientManager.preprocessData(data);
      if (!data) return;
      RoomManager.sendClientReady(
        data,
        this,
        socketId,
        this.getRoomIdFromSocketId(socketId)
      );

      RoomManager.getAndResendUserIds(
        data,
        this,
        socketId,
        this.getRoomIdFromSocketId(socketId)
      );
    });

    socket.on("roomList", (data) => {
      let roomIds = Object.keys(this._ROOMS);
      for (let i = 0; i < roomIds.length; i++) {
        logger.info(`Asking room ${roomIds[i]} about player ids.`);
        RoomManager.getAndResendUserIds(data, this, socketId, roomIds[i]);
      }
    });

    socket.on("sendSeatClaim", (data) => {
      data = ClientManager.preprocessData(data);
      if (!data) return;
      RoomManager.sendSeatClaim(
        data,
        this,
        socketId,
        this.getRoomIdFromSocketId(socketId)
      );
    });
  }

  getRoomIdFromSocketId(socketId) {
    return ServerUtils.getRoomIdFromRelative(
      ServerUtils.getRelativeURL(
        this._SOCKET_CLIENTS[socketId].handshake.headers.referer
      )
    );
  }

  killRoom(roomId) {
    this._roomChoiceManager.removeRoom(roomId);
    this._ROOMS[roomId].kill();
    delete this._ROOMS[roomId];
  }

  static preprocessData(data) {
    jwt.verify(data.token, config.secret, (err, decoded) => {
      if (err) {
        // TODO: tell the client to relog
        logger.error("Data sent by someone with invalid or no token!");
        return;
      }
      data.userId = decoded.id;
    });
    return data;
  }
}

module.exports = {
  ClientManager,
};
