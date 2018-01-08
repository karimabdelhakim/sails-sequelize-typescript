import { DataTypes,Sequelize} from "sequelize";

module.exports = (sequelize:Sequelize, DataTypes:DataTypes) => {

  let User = sequelize.define('User', {
    title: DataTypes.STRING
  });

  return User;
};