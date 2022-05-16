const { logger } = require("../server/logger");
const {
    RoomRequest,
    RoomRequestType,
    RoomMessage,
    RoomMessageType,
  } = require("../server/roomRequests");

/* Inter process communication*/

class ChildCommunicatorManager {
  /* Sends a request to certain room */
  static sendRequestToChild(childProcess, request) {
    let ret = childProcess.send(request);
    if (ret === false) {
      logger.info("Send failed");
    }
  }
}

module.exports = {
  ChildCommunicatorManager,
};
