const path = require("path");
const express = require("express");
const { logger } = require("../server/logger");

class ServerUtils {
  static setHtmlFiles(instance, basePath) {
    instance._app.get("/", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "index.html"));
    });
    instance._app.get("/games", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "gameChoice.html"));
    });
    instance._app.get("/rooms", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "chooseRoom.html"));
    });
    instance._app.use("/client", express.static(path.join(basePath, "client")));
    instance._app.use("/public", express.static(path.join(basePath, "public")));
    instance._app.get("/signup", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "registerForm.html"));
    });
    instance._app.get("/signin", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "loginForm.html"));
    });
    instance._app.get("/api/test", function (req, res) {
      res.sendFile(path.join(basePath, "client/html", "roleTest.html"));
    });
  }

  /* Cuts relative adress from given url */
  static getRelativeURL(serverUrl, url) {
      logger.info(`url: ${serverUrl}`)
    return url.substring(serverUrl.length, serverUrl.lastIndex);
  }
  /* Cuts room id from relativer adress*/
  static getRoomIdFromRelative(roomUrlLength, url) {
    return url.substring(url.length - roomUrlLength);
  }
}

module.exports = {
  ServerUtils,
};
