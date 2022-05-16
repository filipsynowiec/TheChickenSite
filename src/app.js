#!/usr/local/bin/node

const express = require("express");
const http = require("http");
const { logger } = require("./server/logger");
const { ServerUtils } = require("./utils/serverUtils");
const { ClientManager } = require("./serverManagers/clientManager");
const bodyParser = require("body-parser");
const cors = require("cors");

let corsOptions = {
  origin: "http://localhost:8081",
};

class Server {
  constructor(port) {
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._clientManager = new ClientManager(this._server, port);
    this._db = require("./models");
    this._URL = "http://127.0.0.1:" + port + "/";
    this._ROOM_URL_LENGTH = 8;
  }
  run() {
    // routes
    this._app.use(cors(corsOptions));
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));

    require("./routes/auth.routes")(this._app);
    require("./routes/user.routes")(this._app);

    ServerUtils.setHtmlFiles(this, __dirname);
    this._server.listen(this._port);

    const instance = this;
    this._db.sequelize.sync({ force: true }).then(() => {
      logger.info("Drop and resync database");
      this.initial();
    });
    // this._db.sequelize.sync({ force: false });

    this._clientManager.setHandlers(this);
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

let serv = new Server(8080);
logger.info("Server is starting");
serv.run();
