'use strict';

var db = require('../models'),
    util = require('../utils/util');

function isValid(user){
  if(!user.name){
    return false;
  }
  if(!user.email){
    return false;
  }
  if(!user.password){
    return false;
  }
  return true;
};

exports.register = function(req, res, next) {
  db.User.find({ where: { email: req.body.email } }).success(function(entity) {
    if (entity) {
      res.send({ message: "Já existe um usuário com esse email!", error: 2 });
    } else {
      if(isValid(req.body)){
        db.User.create(req.body).success(function(entity) {
          res.send({ message: "Usuário criado com sucesso!", error: 0 });
        });
      }else{
        res.send({ message: "Favor preencher todos os campos!", error: 2 });
      }
    }
  });
};

exports.resetPassword = function(req, res, next) {
  db.User.find({ where: { email: req.body.email } }).success(function(entity) {
    if (entity) {
      var password = new util.generateRandom();
      password = password.generate();
      entity.updateAttributes({ password: password}).success(function(){
        res.send({ message: "Sua nova senha é: " + password, error: 0 });
      });
    } else {
      res.send({ message: "Usuário não encontrado!", error: 2 });
    }
  });
};