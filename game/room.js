#!/usr/bin/node

const { logger } = require("./logger");
const {
  RoomRequest,
  RoomRequestType,
  RoomMessage,
  RoomMessageType,
} = require("./roomRequests");
const { EggGame } = require("./eggGame");
class Room {
  constructor() {
    this._CLIENTS = {};
    this._numberOfClients = 0;
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
        instance.updateStatus(request.getClient(), request.getData());
        break;
      case RoomRequestType.SetGame:
        instance.setGame(request.getData());
        break;
    }
  }
  updateStatus(client, data) {
    this._game.changeEggValue(data.eggValue);
  }
  addClient(client, data) {
    this._CLIENTS[this._numberOfClients] = client;
    this._numberOfClients++;
    this.sendMessage(RoomMessageType.Send, {
      eggValue: this._game.getEggValue(),
    });
    logger.info(`Client ${client} added as ${this._numberOfClients - 1}`);
  }
  sendMessage(type, data) {
    process.send(new RoomMessage(type, data));
    logger.info(`Message sent to server ${data.eggValue}`)
  }
  setGame(data) {
    this._game = new EggGame();
    this._game.registerObserver(this);
    this._game.start();
  }
  update() {
    this.sendMessage(RoomMessageType.Send, {
      eggValue: this._game.getEggValue(),
    });
  }
}

let room = new Room();
room.run();
