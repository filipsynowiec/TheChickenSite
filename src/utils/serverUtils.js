const path = require("path");
const express = require("express");
const { logger } = require("../server/logger");
const constants = require("../constants");

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
