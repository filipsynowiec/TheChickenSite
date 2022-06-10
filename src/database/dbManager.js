class DatabaseManager {
  constructor(db) {
    this._db = db;
  }

  setUpDatabase(dropBefore) {
    //dropBefore = true;
    if (dropBefore == false) {
      this._db.sequelize.sync({ force: false });
      return;
    }
    this._db.sequelize.sync({ force: true }).then(() => {
      this.initialize();
    });
  }

  /* for database */
  initialize() {
    const role = this._db.role;

    for (var i = 0; i < this._db.ROLES.length; i++) {
      role.create({
        id: i + 1,
        name: this._db.ROLES[i],
      });
    }

    const game = this._db.game;

    for (var i = 0; i < this._db.GAMES.length; i++) {
      game.create({
        id: i + 1,
        name: this._db.GAMES[i],
      });
    }
  }
}

module.exports = {
  DatabaseManager,
};
