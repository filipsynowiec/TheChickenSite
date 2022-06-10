const db = require("../../database/models");
const queries = require("../../database/dbQueries");
const User = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Everyone can see this.");
};
exports.userBoard = (req, res) => {
  res.status(200).send("Only logged in user can see this.");
};
exports.adminBoard = (req, res) => {
  res.status(200).send("Only logged in admin can see this.");
};
exports.moderatorBoard = (req, res) => {
  res.status(200).send("Only logged in mod can see this.");
};
exports.userGetData = (req, res) => {
  queries
    .findUserName(req.userId)
    .then((name) => {
      if (name === null) {
        res.status(500).send({
          message: "No such user!",
          successful: false,
        });
      } else {
        res.status(200).send({
          message: "Successfully received data.",
          successful: true,
          name: name,
          userId: req.userId,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Internal error! ${err.message}`,
        successful: false,
        name: null,
      });
    });
  return;
};
exports.ranking = (req, res) => {
  queries.getAllRankings().then(([result, metadata]) => {
    data = { result, metadata };
    res.status(200).send(JSON.stringify(data));
  });
};
