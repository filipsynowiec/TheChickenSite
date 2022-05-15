#!/usr/bin/node

const { logger } = require("./logger");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");
const { EggGame } = require("./games/eggGame/eggGame");
const { TickTackToe } = require("./games/tickTackToe/tickTackToe");
const { Chat } = require("./chat");
const { Seats } = require("./seats");
const fs = require("fs");

class Room {
  constructor() {
    this._CLIENTS = {};
    this._numberOfClients = 0;
    this._chat = new Chat("Chat history:\n");
    this._chat.registerObserver(this);
    this._seats = new Seats();
    this._seats.registerObserver(this);
    this._gameName = null;
  }

  run() {
    process.on("message", (msg) => Room.receiveMessage(msg, this));
    logger.info(`Room running.`);
  }
  static receiveMessage(msg, instance) {
    let request = new RoomRequest(null, null, null, msg);
    switch (request.getType()) {
      case RoomRequestType.Join:
        instance.addClient(request.getClient());
        break;
      case RoomRequestType.Update:
        instance.updateGame(request.getData());
        break;
      case RoomRequestType.SetGame:
        instance.setGame(request.getData());
        break;
      case RoomRequestType.SendChatMessage:
        instance.updateChat(request.getData());
        break;
      case RoomRequestType.SendSeatClaim:
        instance.updateSeats(request.getData());
        break;
      case RoomRequestType.ClientReady:
        instance.prepareClient(request.getClient());
        break;
    }
  }
  prepareClient(client) {
    this.sendChat();
    this.sendStatus();
    logger.info(`Client ${client} ready`);
  }
  updateGame(data) {
    this._game.updateGame(data);
  }
  updateChat(data) {
    this._chat.registerMessage(data, this._chat); // TODO: refactor
  }
  updateSeats(data) {
    this._seats.claimSeat(data, this._seats);
  }
  addClient(client, data) {
    this._CLIENTS[this._numberOfClients] = client;
    this._numberOfClients++;
    this.sendHTML(client);
    logger.info(`Client ${client} added as ${this._numberOfClients - 1}`);
  }
  sendMessage(type, data) {
    process.send(new RoomMessage(type, data));
  }
  setGame(data) {
    this._gameName = data.game;
    switch (data.game) {
      case "EGG_GAME":
        this._game = new EggGame();
        break;
      case "TICK_TACK_TOE":
        this._game = new TickTackToe(this._seats);
        break;
      default:
        logger.error(`No such game! - ${data.game}`);
        return;
    }

    this._game.registerObserver(this);
    logger.info(`Game set`);
  }
  sendStatus() {
    let status = this._game.getStatus();
    this.sendMessage(RoomMessageType.Send, status);
    logger.info(`Message sent to server with status: ${status}`);
  }
  sendChat() {
    this.sendMessage(RoomMessageType.ChatHistory, {
      chatHistory: this._chat.history,
    });
  }
  sendSeats() {
    this.sendMessage(RoomMessageType.Seats, {
      seats: this._seats.seats,
    });
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
