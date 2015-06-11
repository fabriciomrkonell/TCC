var db = require('../models'),
    passwordHash = require('password-hash');

exports.findById = function(id, fn) {
  db.User.find({ where: { id: id } }).success(function(entity) {
    if (entity) {
      fn(null, entity);
    } else {
      fn(new Error(id));
    }
  });
};

exports.findByEmail = function(email, password, fn) {
  db.User.find({ where: { email: email } }).success(function(entity) {
    if (entity) {
      if(passwordHash.verify(password, entity.password)){
        return fn(null, entity);
      }else{
        return fn(null, null);
      }
    } else {
      return fn(null, null);
    }
  });
};