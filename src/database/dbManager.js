class DatabaseManager {
  constructor(db) {
    this._db = db;
  }

  setUpDatabase(dropBefore) {
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
    let role = this._db.role;
    role.create({
      id: 1,
      name: "admin",
    });

    role.create({
      id: 2,
      name: "moderator",
    });

    role.create({
      id: 3,
      name: "user",
    });
  }
}

module.exports = {
  DatabaseManager,
};
