const path = require("path");
const express = require("express");

class HtmlManager {
  // TODO: move this to routes
  static setHtmlFiles(instance, basePath) {
    instance._app.get("/", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "index.html"));
    });
    instance._app.get("/games", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "gameChoice.html"));
    });
    instance._app.get("/rooms", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "chooseRoom.html"));
    });
    instance._app.use(
      "/client",
      express.static(path.join(basePath, "src/client"))
    );
    instance._app.use("/public", express.static(path.join(basePath, "public")));
    instance._app.get("/signup", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "registerForm.html"));
    });
    instance._app.get("/signin", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "loginForm.html"));
    });
    instance._app.get("/api/test", function (req, res) {
      res.sendFile(path.join(basePath, "src/client/html", "roleTest.html"));
    });
  }
}

module.exports = {
  HtmlManager,
};
