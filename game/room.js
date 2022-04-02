#!/usr/bin/node

const { logger } = require("./logger");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");
const { EggGame } = require("./eggGame");
const { Chat } = require("./chat");
const fs = require("fs");
class Room {
  constructor() {
    this._CLIENTS = {};
    this._numberOfClients = 0;
    this._chat = new Chat("Chat history:\n");
    this._chat.registerObserver(this);
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
        instance.updateStatus(request.getData());
        break;
      case RoomRequestType.SetGame:
        instance.setGame(request.getData());
        break;
      case RoomRequestType.SendChatMessage:
        instance.updateChat(request.getData());
        break;
    }
  }
  updateStatus(data) {
    this._game.changeEggValue(data.eggValue);
  }
  updateChat(data) {
    this._chat.registerMessage(data, this._chat); // TODO: refactor
  }
  addClient(client, data) {
    this._CLIENTS[this._numberOfClients] = client;
    this._numberOfClients++;
    this.sendHTML(client);
    this.sendChat();
    this.sendStatus();
    logger.info(`Client ${client} added as ${this._numberOfClients - 1}`);
  }
  sendMessage(type, data) {
    process.send(new RoomMessage(type, data));
    logger.info(`Message sent to server ${data.eggValue}`);
  }
  setGame(data) {
    this._game = new EggGame();
    this._game.registerObserver(this);
    this._game.start();
  }
  sendStatus() {
    this.sendMessage(RoomMessageType.Send, {
      eggValue: this._game.getEggValue(),
    });
  }
  sendChat() {
    this.sendMessage(RoomMessageType.ChatHistory, {
      chatHistory: this._chat.history,
    });
  }
  sendHTML(client) {
    fs.readFile("eggGame.html", "utf8", (err, data) => {
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
