const constants = require("./constants");

class ServerUtils {
  /* Cuts relative adress from given url */
  static getRelativeURL(url) {
    return url.substring(constants.URL.length, constants.URL.lastIndex);
  }
  /* Cuts room id from relativer adress*/
  static getRoomIdFromRelative(url) {
    return url.substring(url.length - constants.ROOM_URL_LENGTH);
  }
}

module.exports = {
  ServerUtils,
};
