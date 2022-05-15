const db = require("../models");
const User = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Public content.");
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
exports.userGetName = async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (user === null) {
    res.status(500).send("No entry in database!");
  } else {
    res.status(200).send(user.username);
  }
  return;
};
