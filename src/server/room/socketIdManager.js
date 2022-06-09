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
