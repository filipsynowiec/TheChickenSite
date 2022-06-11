class SocketIdManager {
  constructor() {
    this.userIdToSockets = {};
    this.socketToUserId = {};
  }
  addSocket(socket, userId) {
    this.socketToUserId[socket] = userId;
    if (!this.userIdToSockets[userId]) {
      this.userIdToSockets[userId] = new Set();
    }
    this.userIdToSockets[userId].add(socket);
  }
  removeSocket(socket) {
    let userId = this.socketToUserId[socket];
    let allSocketsDisconnected = false;
    if (userId != null) {
      this.userIdToSockets[userId].delete(socket);
      if (this.userIdToSockets[userId].size == 0) {
        delete this.userIdToSockets[userId];
        allSocketsDisconnected = true;
      }
    }
    delete this.socketToUserId[socket];
    return allSocketsDisconnected;
  }
  getUserId(socket) {
    return this.socketToUserId[socket];
  }

  getPlayerSockets(userId) {
    return this.userIdToSockets[userId];
  }

  getPlayerIds() {
    return Object.keys(this.userIdToSockets);
  }
}

module.exports = {
  SocketIdManager,
};
