const db = require("../../database/models");
const { logger } = require("../../utils/logger");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsername = (req, res, next) => {
  // Username
  logger.info("Checking for duplicate username");
  User.findOne({
    where: {
      username: req.body.username.toLowerCase(),
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        successful: false,
        message: "Failed! Username is taken.",
      });
      return;
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          successful: false,
          message: "Failed! Role " + req.body.roles[i] + " does not exist.",
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsername: checkDuplicateUsername,
  checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
