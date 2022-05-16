#!/usr/bin/node

const express = require("express");
const http = require("http");
const { logger } = require("./server/logger");
const { HtmlManager } = require("./server/serverManagers/htmlManager");
const { ClientManager } = require("./server/serverManagers/clientManager");
const { DatabaseManager } = require("./database/dbManager");
const bodyParser = require("body-parser");
const cors = require("cors");
const constants = require("./constants");
let corsOptions = {
  origin: "http://localhost:8081",
};

class Server {
  constructor() {
    this._app = express();
    this._server = http.Server(this._app);
    this._clientManager = new ClientManager(this._server);
    this._db = require("./models");
    this._databaseManager = new DatabaseManager(this._db);
  }
  run() {
    // routes
    this._app.use(cors(corsOptions));
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));

    require("./routes/auth.routes")(this._app);
    require("./routes/user.routes")(this._app);

    HtmlManager.setHtmlFiles(this, __dirname);
    this._server.listen(constants.PORT);
    this._databaseManager.setUpDatabase(true); // true - drop and sync db; false - dont drop
    this._clientManager.setHandlers(this._app);
  }
}

let serv = new Server();
logger.info(`Server is starting on port ${constants.PORT}`);
serv.run();
