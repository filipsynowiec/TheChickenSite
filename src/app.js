#!/usr/local/bin/node

const express = require("express");
const http = require("http");
const { logger } = require("./server/logger");
const { ServerUtils } = require("./utils/serverUtils");
const { HtmlManager } = require("./serverManagers/htmlManager");
const { ClientManager } = require("./serverManagers/clientManager");
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

    const instance = this;
    this._db.sequelize.sync({ force: true }).then(() => {
      logger.info("Drop and resync database");
      this.initial();
    });
    // this._db.sequelize.sync({ force: false });

    this._clientManager.setHandlers(this._app);
  }
  /* for database */
  initial() {
    let Role = this._db.role;
    Role.create({
      id: 1,
      name: "admin",
    });

    Role.create({
      id: 2,
      name: "moderator",
    });

    Role.create({
      id: 3,
      name: "user",
    });
  }
}

let serv = new Server();
logger.info(`Server is starting on port ${constants.PORT}`);
serv.run();
