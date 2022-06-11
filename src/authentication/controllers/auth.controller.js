const db = require("../../database/models");
const { logger } = require("../../utils/logger");
const config = require("../../config/auth.config");
const User = db.user;
const Role = db.role;
const Game = db.game;
const Score = db.score;
const Op = db.Sequelize.Op;
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
const { user } = require("../../database/models");
const roleModel = require("../../database/models/role.model");

exports.signup = (req, res) => {
  // list all games
  const findGames = Game.findAll();

  // find role_id and add user
  const createUser = Role.findOne({
    where: {
      name: {
        [Op.eq]: req.body.role,
      },
    },
  }).then((role) => {
    const user = User.create({
      username: req.body.username.toLowerCase(),
      password: bcrypt.hashSync(req.body.password, 8),
      role_id: role.id,
    });
    logger.info(`New user added: ${req.body.username.toLowerCase()}, ${role.name}`);
    return user;
  });

  // set player's elo to 1000 in every game
  Promise.all([findGames, createUser])
    .then((values) => {
      logger.error(values);
      const games = values[0];
      const user = values[1];

      for (var i = 0; i < games.length; i++) {
        Score.create({
          user_id: user.id,
          game_id: games[i].id,
          score: 1000,
        });
        logger.info(
          `Setting ${user.username}'s score in ${games[i].name} to 1000`
        );
      }
    })
    .then(() => {
      res.send({ message: "User was registered successfully!" });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username.toLowerCase(),
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          successful: false,
          message: "Invalid Password!",
        });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 * 365 * 100, // 24 hours * 365 * 100
      });
      Role.findByPk(user.role_id).then((role) => {
        res.cookie("auth", token);
        res.status(200).send({
          id: user.id,
          username: user.username,
          successful: true,
          role: role.name.toUpperCase(),
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      logger.error(err.message);
      res.status(500).send({ message: err.message, successful: false });
    });
};
