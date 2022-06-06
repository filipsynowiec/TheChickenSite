module.exports = (sequelize, Sequelize) => {
  const Score = sequelize.define("scores", {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    game_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return Score;
};
