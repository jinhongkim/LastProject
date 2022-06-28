const Sequelize = require("sequelize");

// User model
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          primaryKey : true,
          unique : true,
          autoIncrement : true,
          type : Sequelize.INTEGER,
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Room",
        tableName: "Rooms",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany()
  }
};