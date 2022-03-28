const { logger } = require("./logger");

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

  registerMessage(message, instance) {
    instance._chatHistory += `${message.name}: ${message.value}\n`;
    instance._observers.forEach((obs) => obs.update());
  }
}

module.exports = { Chat };
