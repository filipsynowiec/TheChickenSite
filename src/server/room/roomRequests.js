const { logger } = require("../../utils/logger");

class RoomRequestType {
  static Join = new RoomRequestType("Join");
  static Update = new RoomRequestType("Update");
  static SetGame = new RoomRequestType("SetGame");
  static SendChatMessage = new RoomRequestType("SendChatMessage");
  static SendSeatClaim = new RoomRequestType("SendSeatClaim");
  static ClientReady = new RoomRequestType("ClientReady");
  static SendUserIdsToParent = new RoomRequestType("SendUserIdsToParent");
  constructor(name) {
    this._name = name;
  }
}

class RoomRequest {
  constructor(client, type, data, obj) {
    if (obj != null) {
      this._client = obj._client;
      this._type = RoomRequestType[obj._type._name];
      this._data = obj._data;
      logger.info(
        `Got ${this._type._name} request with data ${Object.entries(
          this._data
        )}`
      );
    } else {
      this._client = client;
      this._type = type;
      this._data = data;
      logger.info(`Created ${this._type} with ${Object.entries(this._data)}`);
    }
  }
  getType() {
    return this._type;
  }
  getClient() {
    return this._client;
  }
  getData() {
    return this._data;
  }
}

class RoomMessageType {
  static Send = new RoomMessageType("Send");
  static ChatHistory = new RoomMessageType("ChatHistory");
  static Seats = new RoomMessageType("Seats");
  static SendHTML = new RoomMessageType("SendHTML");
  static UserIds = new RoomMessageType("UserIds");
  constructor(name) {
    this._name = name;
  }
}

class RoomMessage {
  constructor(type, data, obj) {
    if (obj != null) {
      this._type = RoomMessageType[obj._type._name];
      this._data = obj._data;
    } else {
      this._type = type;
      this._data = data;
    }
  }

  getType() {
    return this._type;
  }
  getData() {
    return this._data;
  }
}

RoomRequest.prototype.toString = function roomRequestToString() {
  return `RoomRequest {_client: ${this._client},\n _type: ${this._type},\n }`;
};
RoomMessage.prototype.toString = function roomMessageToString() {
  return `RoomMessage {_type: ${this._type}}`;
};

module.exports = {
  RoomRequest: RoomRequest,
  RoomRequestType: RoomRequestType,
  RoomMessageType: RoomMessageType,
  RoomMessage: RoomMessage,
};
