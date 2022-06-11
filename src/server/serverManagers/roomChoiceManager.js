const { logger } = require("../../utils/logger");

/*
 * This is a class that handles all communications connected to room choosing.
 */
class RoomChoiceManager {
  constructor() {
    this._ROOMS = {};
  }
  /* extracts game name from url (there might be a better way to do this, but I haven't been able to find yet) */
  static getGameFromUrl(url) {
    return url.substring(url.indexOf("?game=") + 6, url.lastIndex);
  }
  /* extracts game name directly from socket (see getGameFromUrl function) */
  static getGameFromSocket(socket) {
    return RoomChoiceManager.getGameFromUrl(socket.handshake.headers.referer);
  }
  /* provides adequate list of rooms to requesting socket */
  manage(socket) {
    logger.info(`${socket.id}`);
    let url = socket.handshake.headers.referer;
    let game = RoomChoiceManager.getGameFromUrl(url);
    logger.info(`Game ${game}`);
    // user will send "roomList" request to get the list
  }
  /* adds room to rooms subset adequate to the game*/
  addRoom(room, game) {
    logger.info(`Game ${game}`);
    this._ROOMS[game].add(room);
  }
  removeRoom(room) {
    for (const [key, value] of Object.entries(this._ROOMS)) {
      if (value.has(room)) {
        value.delete(room);
        break;
      }
    }
  }
  /* initializes game buckets for rooms */
  setGames(games) {
    for (const [key, value] of Object.entries(games)) {
      this._ROOMS[key] = new Set();
      logger.info(`${key}`);
    }
  }
}
module.exports = {
  RoomChoiceManager,
};
