const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config.js");
const db = require("../../database/models");
const { logger } = require("../../utils/logger.js");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  console.log(token);
  logger.info(`Token read is ${token}`);
  if (!token) {
    // user has no valid token, he didn't sign in or didn't link it in the request
    return res.redirect("/games");
  }
  jwt.verify(token.split(" ")[1], config.secret, (err, decoded) => {
    if (err) {
      // user has invalid token, only way to regenerate it is to sign in
      return res.redirect("/signin");
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId)
    .then((user) => {
      return Role.findByPk(user.role_id);
    })
    .then((role) => {
      if (role.name === "admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Admin Role!",
      });
    });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId)
    .then((user) => {
      console.log(`FOUND: ${user}`);
      return Role.findByPk(user.role_id);
    })
    .then((role) => {
      console.log(`FOUND: ${role}`);
      if (role.name === "moderator" || role.name === "admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Moderator Role!",
      });
    });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
};

module.exports = authJwt;
