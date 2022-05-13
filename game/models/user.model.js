module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    login: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  });
  return User;
};
