const { logger } = require("../../utils/logger");

/* Inter process communication*/

class ChildCommunicatorManager {
  /* Sends a request to certain room */
  static sendRequestToChild(childProcess, request) {
    let ret = childProcess.send(request);
    if (ret === false) {
      logger.info("IPC failed - error while sending request to child process");
    }
  }
}

module.exports = {
  ChildCommunicatorManager,
};
