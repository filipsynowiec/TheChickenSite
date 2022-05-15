const db = require("../models");
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
exports.userGetName = async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (user === null) {
    res.status(500).send({
      message: "No such user in database!",
      successful: false,
      name: null,
    });
  } else {
    res.status(200).send({
      message: "Successfully received name.",
      successful: true,
      name: user.username,
    });
  }
  return;
};
