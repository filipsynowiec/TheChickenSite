#!/usr/bin/node

const express = require("express");
const http = require("http");
const { logger } = require("./src/utils/logger");
const { HtmlManager } = require("./src/server/serverManagers/htmlManager");
const { ClientManager } = require("./src/server/serverManagers/clientManager");
const { DatabaseManager } = require("./src/database/dbManager");
const bodyParser = require("body-parser");
const cors = require("cors");
const constants = require("./src/utils/constants");
let corsOptions = {
  origin: `http://localhost:${process.env.PORT}`,
};

class Server {
  constructor() {
    this._app = express();
    this._server = http.Server(this._app);
    this._clientManager = new ClientManager(this._server, __dirname);
    this._db = require("./src/database/models");
    this._databaseManager = new DatabaseManager(this._db);
  }
  run() {
    // routes
    this._app.use(cors(corsOptions));
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));

    require("./src/authentication/routes/auth.routes")(this._app);
    require("./src/authentication/routes/user.routes")(this._app);

    HtmlManager.setHtmlFiles(this, __dirname);
    this._server.listen(constants.PORT);
    this._databaseManager.setUpDatabase(true); // true - drop and sync db; false - dont drop
    this._clientManager.setHandlers(this._app);
  }
}

let serv = new Server();
logger.info(`Server is starting on port ${constants.PORT}`);
serv.run();