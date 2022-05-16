const { logger } = require("../logger");
const { ServerUtils } = require("../../utils/serverUtils");
const { RoomManager } = require("./roomManager");
const { GameChoiceManager } = require("./gameChoiceManager");
const { RoomChoiceManager } = require("./roomChoiceManager");
const randomstring = require("randomstring");
const child_process = require("child_process");
const constants = require("../../constants");

class ClientManager {
  constructor(server) {
    this._io = require("socket.io")(server, {});
    this._numberOfClients = 0;
    this._SOCKET_CLIENTS = {};
    this._ROOMS = {};
    this._gameChoiceManager = new GameChoiceManager();
    this._roomChoiceManager = new RoomChoiceManager();
    this._gameChoiceManager.loadGamesJSON();
    this._roomChoiceManager.setGames(this._gameChoiceManager.games);
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
    logger.info(`Params ---->>> ${socket.handshake.query.param}`);

    this.setRequestMethods(socket, app);

    let relative_url = ServerUtils.getRelativeURL(
      socket.handshake.headers.referer
    ).substring();
    let roomId = ServerUtils.getRoomIdFromRelative(relative_url);

    logger.info(`Client ${socketId} connected to ${relative_url}`);
    /* if client connected to certain room -> handle the connection */
    if (this._ROOMS[roomId] != null) {
      this.handleConnection(roomId, socketId);
    }
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
      let childProcess = child_process.fork("./server/room.js", {
        detached: false,
      });
      childProcess.on("message", (msg) => {
        let receivedMessage = RoomManager.receiveMessageFromRoom(msg, roomId);
        this.sendToClientsInRoom(
          receivedMessage.name,
          receivedMessage.data,
          receivedMessage.roomId
        );
      });

      this._ROOMS[roomId] = childProcess;
      this._roomChoiceManager.addRoom(roomId, game);

      RoomManager.createRoom(app, childProcess, roomId, game);
      this.sendToOneClient("roomId", { roomId: roomId }, socketId);
      this.sendToAllClients("newRoomCreated", { roomId: roomId });
    });

    socket.on("requestAction", (data) =>
      RoomManager.updateStatus(data, this, socketId)
    );
    socket.on("joinRoom", (data) => {
      let game = RoomChoiceManager.getGameFromSocket(
        this._SOCKET_CLIENTS[socketId]
      );
      RoomManager.joinRoom(data.roomId, game, app);
      this.sendToOneClient("roomId", { roomId: data.roomId }, socketId);
    });
    socket.on("sendChatMessage", (data) =>
      RoomManager.sendChatMessage(data, this, socketId)
    );
    socket.on("clientReady", (data) =>
      RoomManager.sendClientReady(data, this, socketId)
    );
    socket.on("sendSeatClaim", (data) =>
      RoomManager.sendSeatClaim(data, this, socketId)
    );
  }
}

module.exports = {
  ClientManager,
};
