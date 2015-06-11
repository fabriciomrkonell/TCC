module.exports = function(sequelize, DataTypes) {
  var Cords = sequelize.define('Cords', {
    lat: {
      type: DataTypes.STRING(100)
    },
    lon: {
      type: DataTypes.STRING(100)
    },
    history: {
      type: DataTypes.INTEGER(100)
    }
  }, {
    classMethods: {
      associate: function(models) {
        Cords.belongsTo(models.Equipment);
      }
    }
  });
  return Cords;
};
