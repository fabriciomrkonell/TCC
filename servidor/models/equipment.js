module.exports = function(sequelize, DataTypes) {
  var Equipment = sequelize.define('Equipment', {
    description: {
      type: DataTypes.STRING(60)
    },
    token: {
      type: DataTypes.STRING(60)
    },
    status: {
      type: DataTypes.BOOLEAN(),
      defaultValue: true
    },
    history: {
      type: DataTypes.INTEGER(100),
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        Equipment.belongsTo(models.User);
        Equipment.hasMany(models.Cords, { onDelete: 'cascade' });
      }
    }
  });
  return Equipment;
};
