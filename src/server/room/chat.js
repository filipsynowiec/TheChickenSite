const { logger } = require("../../utils/logger");

class Chat {
  constructor(chatHistory) {
    this._chatHistory = chatHistory;
    this._observers = [];
  }

  get history() {
    return this._chatHistory;
  }

  registerObserver(observer) {
    this._observers.push(observer);
  }

  registerMessage(message) {
    this._chatHistory.push({ user: message.name, message: message.value });
    this._observers.forEach((obs) => obs.sendChat());
  }
}

module.exports = { Chat };
