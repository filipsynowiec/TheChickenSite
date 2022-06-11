#!/usr/bin/node

const { logger } = require("../../utils/logger");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");
const { EggGame } = require("../games/eggGame/eggGame");
const { TickTackToe } = require("../games/tickTackToe/tickTackToe");
const { Scrabble } = require("../games/scrabble/scrabble");
const { Chat } = require("./chat");
const { Seats } = require("./seats");
const { SocketIdManager } = require("./socketIdManager");
const fs = require("fs");

class Room {
  constructor() {
    this._socketIdManager = new SocketIdManager(); // sockets <=> ids
    this._numberOfSockets = 0;
    this._chat = new Chat([]);
    this._chat.registerObserver(this);
    this._seats = new Seats();
    this._seats.registerObserver(this);
    this._gameName = null;
  }

  run() {
    process.on("message", (msg) => this.receiveMessage(msg));
    logger.info(`Room running.`);
  }
  receiveMessage(msg) {
    let request = new RoomRequest(null, null, null, msg);
    switch (request.getType()) {
      case RoomRequestType.Join:
        this.addClient(request.getClient());
        break;
      case RoomRequestType.Update:
        this.updateGame(request.getData());
        break;
      case RoomRequestType.SetGame:
        this.setGame(request.getData());
        break;
      case RoomRequestType.SendChatMessage:
        this.updateChat(request.getData());
        break;
      case RoomRequestType.SendSeatClaim:
        this.updateSeats(request.getClient(), request.getData());
        break;
      case RoomRequestType.ClientReady:
        this.prepareClient(request.getClient(), request.getData());
        break;
      case RoomRequestType.RemoveClient:
        this.removeClient(request.getClient());
        break;
      case RoomRequestType.SendUserIdsToParent:
        this.SendUserIdsToParent();
        break;
    }
  }
  SendUserIdsToParent() {
    let data = {
      userIds: this._socketIdManager.getPlayerIds(),
      gameName: this._gameName,
    };
    logger.info(`Room: sending data: ${Object.entries(data)} to parent`);
    this.sendMessage(RoomMessageType.UserIds, data);
  }

  prepareClient(client, data) {
    if (!data.userId) {
      logger.warn("User Id is not known!");
    } else {
      logger.info(`Client ${data.userId} with socket ${client} prepared.`);
      this._socketIdManager.addSocket(client, data.userId);
      this._numberOfSockets++;
    }
    this.sendChat();
    this.sendSeats();
    this.sendStatus();
    logger.info(`Client ${client} ready`);
  }
  updateGame(data) {
    this._game.updateGame(data);
  }
  updateChat(data) {
    this._chat.registerMessage(data);
  }
  updateSeats(client, data) {
    let clientId = this._socketIdManager.getUserId(client);
    logger.info(`Client id ${clientId} socke ${client}`);
    this._seats.claimSeat(clientId, data);
  }
  addClient(client) {
    this.sendHTML(client);
  }
  removeClient(client) {
    let clientId = this._socketIdManager.getUserId(client);
    let abandonSeat = this._socketIdManager.removeSocket(client);
    logger.info(`${clientId} removed from  room`);
    this._numberOfSockets--;
    if (abandonSeat) {
      this._seats.abandonSeat(clientId);
      this.sendSeats();
      this.sendStatus();
    }
    if (this._numberOfSockets == 0) {
      this.sendKillRequest();
    }
  }
  sendMessage(type, data) {
    process.send(new RoomMessage(type, data));
  }
  restartGame() {
    this._game.restart();
  }
  setGame(data) {
    this._gameName = data.game;
    switch (data.game) {
      case "EGG-GAME":
        this._game = new EggGame();
        break;
      case "TIC-TAC-TOE":
        this._game = new TickTackToe(this._seats);
        break;
      case "SCRABBLE":
        this._game = new Scrabble(this._seats);
        break;
      default:
        logger.error(`No such game! - ${data.game}`);
        return;
    }

    this._game.registerObserver(this);
    logger.info(`Game set`);
  }
  sendKillRequest() {
    this.sendMessage(RoomMessageType.KillRequest, {});
  }
  sendStatus() {
    const status = this._game.getStatus();
    this.sendMessage(RoomMessageType.Send, status);
    logger.info(`Message sent to server with status: ${status}`);
  }
  sendChat() {
    this.sendMessage(RoomMessageType.ChatHistory, {
      chatHistory: this._chat.history,
    });
  }
  sendSeats() {
    const status = this._seats.getSeatsStatus();
    this.sendMessage(RoomMessageType.Seats, status);
  }
  sendHTML(client) {
    fs.readFile(this._game.getHTMLLocation(), "utf8", (err, data) => {
      if (err) {
        logger.error(err);
        return;
      }
      this.sendMessage(RoomMessageType.SendHTML, {
        gameHTML: data,
        client: client,
      });
    });
  }
}

let room = new Room();
room.run();
