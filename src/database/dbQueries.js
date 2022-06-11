const { game, sequelize } = require("./models");
const { logger } = require("../utils/logger");
const db = require("./models");
const User = db.user;
const Game = db.game;
const Score = db.score;
const Op = db.Sequelize.Op;

const findUserName = function (id) {
  return new Promise((resolve, reject) => {
    User.findByPk(id).then((user) => {
      if (!user) {
        reject(new Error("No user in database"));
      } else {
        resolve(user.username);
      }
    });
  });
};

const findGameId = function (gameName) {
  return Game.findOne({
    where: {
      name: gameName,
    },
  }).then((game) => {
    if (!game) throw new Error("No such game in database");
    return game.id;
  });
};

const getScore = function (userId, gameName) {
  return findGameId(gameName)
    .then((gameId) => {
      return Score.findOne({
        where: {
          game_id: gameId,
          user_id: userId,
        },
      });
    })
    .then((score) => {
      if (!score) {
        throw new Error(
          `No score in database for uderId=${userId}, gameId=${gameId}`
        );
      } else {
        return score.score;
      }
    });
};

const updateScore = function (userId, gameName, newValue) {
  return findGameId(gameName).then((gameId) => {
    return Score.update(
      { score: newValue },
      {
        where: {
          game_id: gameId,
          user_id: userId,
        },
      }
    );
  });
};

const getAllRankings = function () {
  return sequelize.query(
    `SELECT u.username, s.score, g.name AS "game" FROM scores AS s LEFT JOIN users AS u ON (s.user_id = u.id) LEFT JOIN games AS g on (s.game_id = g.id);`
  );
};

// TODO: optimizations
const getGameRankings = function (userIds, gameName) {
  return sequelize
    .query(
      `SELECT u.id, u.username, s.score FROM scores AS s LEFT JOIN users AS u ON (s.user_id = u.id) LEFT JOIN games AS g ON (s.game_id = g.id) WHERE (g.name='${gameName}');`
    )
    .then(([results, metadata]) => {
      logger.info(`Query: ${JSON.stringify(userIds)}, ${gameName}`);
      logger.info(`Query result: ${JSON.stringify(results)}`);
      result = {};
      for (const tuple of results) {
        for (const userId of userIds) {
          // intentional == instead of ===
          if (userId == tuple.id) {
            result[tuple.username] = tuple.score;
          }
        }
      }
      logger.info(`Important result: ${JSON.stringify(result)}`);
      return result;
    });
};

exports.findUserName = findUserName;
// no need to export findGameId
exports.getScore = getScore;
exports.updateScore = updateScore;
exports.getAllRankings = getAllRankings;
exports.getGameRankings = getGameRankings;
