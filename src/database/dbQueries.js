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

const getAllGamesList = function () {
  return sequelize
    .query(`SELECT g.name FROM games AS g;`)
    .then(([results, metadata]) => {
      logger.info(`Get all games list: ${JSON.stringify(results)}`);
      let result = [];
      for (let elem of results) {
        let name = elem["name"];
        result.push(name);
      }
      logger.info(`Returning: ${result}`);
      return result;
    });
};

const getGameRankings = function (gameName) {
  return sequelize
    .query(
      `SELECT u.id, u.username, s.score FROM scores AS s LEFT JOIN users AS u ON (s.user_id = u.id) LEFT JOIN games AS g ON (s.game_id = g.id) WHERE (g.name='${gameName}');`
    )
    .then(([results, metadata]) => {
      logger.info(`Get game ${gameName} results: ${JSON.stringify(results)}`);
      let result = {};
      for (const tuple of results) {
        result[tuple.username] = tuple.score;
      }
      logger.info(`Returning: ${JSON.stringify(result)}`);
      return result;
    });
};

const getUserRankings = function (userId) {
  return sequelize
    .query(
      `SELECT g.name, s.score FROM scores AS s LEFT JOIN games AS g ON (s.game_id = g.id) WHERE (s.user_id='${userId}');`
    )
    .then(([results, metadata]) => {
      logger.info(`Get user ${userId} results: ${JSON.stringify(results)}`);
      logger.info(`Returning: ${JSON.stringify(results)}`);
      return results;
    });
};

// TODO: optimizations
const getFilteredGameRankings = function (userIds, gameName) {
  return sequelize
    .query(
      `SELECT u.id, u.username, s.score FROM scores AS s LEFT JOIN users AS u ON (s.user_id = u.id) LEFT JOIN games AS g ON (s.game_id = g.id) WHERE (g.name='${gameName}');`
    )
    .then(([results, metadata]) => {
      logger.info(
        `Get filtered game results: ${JSON.stringify(userIds)}, ${gameName}`
      );
      let result = {};
      for (const tuple of results) {
        for (const userId of userIds) {
          // intentional == instead of ===
          if (userId == tuple.id) {
            result[tuple.username] = tuple.score;
          }
        }
      }
      logger.info(`Returning: ${JSON.stringify(result)}`);
      return result;
    });
};

exports.findUserName = findUserName;
// no need to export findGameId
exports.getScore = getScore;
exports.updateScore = updateScore;
exports.getAllRankings = getAllRankings;
exports.getAllGamesList = getAllGamesList;
exports.getGameRankings = getGameRankings;
exports.getUserRankings = getUserRankings;
exports.getFilteredGameRankings = getFilteredGameRankings;
