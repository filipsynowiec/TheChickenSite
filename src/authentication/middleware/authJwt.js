const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config.js");
const db = require("../../database/models");
const { logger } = require("../../utils/logger.js");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  logger.info(`Token read is ${token}`);
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  jwt.verify(token.split(" ")[1], config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message:
          "Invalid token provided! Please generate new token by logging in.",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    Role.findByPk(user.roleId).then((role) => {
      if (role.name === "admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    });
  });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    Role.findByPk(user.roleId).then((role) => {
      if (role.name === "moderator" || role.name === "admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Moderator Role!",
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
};

module.exports = authJwt;
