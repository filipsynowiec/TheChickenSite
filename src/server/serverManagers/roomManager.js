const { logger } = require("../../utils/logger");
const fs = require("fs");
const { authJwt } = require("../../authentication/middleware");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("../room/roomRequests");
const { ChildCommunicatorManager } = require("./childCommunicatorManager");

class RoomManager {
  /* Creates room and redirects client to its page */
  static createRoom(app, childProcess, roomId, game) {
    logger.info(`Room ${roomId} created with process ${childProcess.pid}`);
    ChildCommunicatorManager.sendRequestToChild(
      childProcess,
      new RoomRequest(null, RoomRequestType.SetGame, { game: game })
    );
    RoomManager.joinRoom(roomId, game, app);
    return roomId;
  }

  static joinRoom(roomId, game, app) {
    app.get("/room/" + roomId, function (req, res) {
      fs.readFile("src/client/html/room.html", "utf8", (err, data) => {
        if (err) {
          logger.error(err);
          return;
        }

        switch (game) {
          case "EGG-GAME":
            data = data.replace(
              "<!--__GAME_SCRIPT__-->",
              '<script src="/client/js/eggGameClient.js"></script>'
            );
            break;
          case "TIC-TAC-TOE":
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
  }
  // get user ids, send them to server and let the server forward them to ALL connected users
  static getAndResendUserIds(data, instance, socketId, roomId) {
    ChildCommunicatorManager.sendRequestToChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendUserIdsToParent, data)
    );
  }

  /* Function invoked when client udpates the status of the game */
  static updateStatus(data, instance, socketId, roomId) {
    ChildCommunicatorManager.sendRequestToChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.Update, data)
    );
  }

  static sendClientReady(data, instance, socketId, roomId) {
    ChildCommunicatorManager.sendRequestToChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.ClientReady, data)
    );
  }

  static sendChatMessage(data, instance, socketId, roomId) {
    ChildCommunicatorManager.sendRequestToChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendChatMessage, data)
    );
  }

  static sendSeatClaim(data, instance, socketId, roomId) {
    ChildCommunicatorManager.sendRequestToChild(
      instance._ROOMS[roomId],
      new RoomRequest(socketId, RoomRequestType.SendSeatClaim, data)
    );
  }

  static connectNewClientToRoom(room, client) {
    ChildCommunicatorManager.sendRequestToChild(
      room,
      new RoomRequest(client, RoomRequestType.Join, {})
    );
  }

  /* Receives message from room and propagates it to all clients connected to that room */
  static receiveMessageFromRoom(msg, roomId) {
    let message = new RoomMessage(null, null, msg);
    logger.info(`Message type: ${message.getType()}`);
    switch (message.getType()) {
      case RoomMessageType.Send:
        return {
          name: "updateStatus",
          data: message.getData(),
          roomId: roomId,
        };
      case RoomMessageType.SendHTML:
        return {
          name: "gameHTML",
          data: { gameHTML: message.getData().gameHTML }, // TODO: make it like others
          roomId: message.getData().client,
        };
      case RoomMessageType.ChatHistory:
        return {
          name: "updateChat",
          data: message.getData(),
          roomId: roomId,
        };
      case RoomMessageType.Seats:
        return {
          name: "updateSeats",
          data: message.getData(),
          roomId: roomId,
        };
      case RoomMessageType.UserIds:
        return {
          name: "userIds",
          data: message.getData(),
        };
      default:
        logger.error(`No such message type! - ${message.getType()}`);
        return;
    }
  }
}

module.exports = {
  RoomManager,
};
