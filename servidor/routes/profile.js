'use strict';

var db = require('../models');

function isValid(user){
  if(!user.name){
    return false;
  }
  if(!user.email){
    return false;
  }
  return true;
};

exports.persistProfile = function(req, res, next) {
  db.User.find({ where: { email: req.user.email } }).success(function(entity) {
    if (entity) {
      if(isValid(req.body)){
        if(req.body.email == entity.email){
          entity.updateAttributes(req.body).success(function(entity) {
            res.send({ message: "Usuário atualizado com sucesso!", error: 0 });
          });
        }else{
          db.User.find({ where: { email: req.body.email } }).success(function(entityAux) {
            if(entity){
              res.send({ message: "Já existe um usuário com esse email!", error: 2 });
            }else{
              entity.updateAttributes(req.body).success(function(entity) {
                res.send({ message: "Usuário atualizado com sucesso!", error: 0 });
              });
            }
          });
        }
      }else{
        res.send({ message: "Favor preencher todos os campos!", error: 2 });
      }
    } else {
      res.send({ message: "Usuário não encontrado!", error: 1 });
    }
  });
};

exports.persistProfilePassword = function(req, res, next) {
  db.User.find({ where: { email: req.user.email } }).success(function(entity) {
    if (entity) {
      if(req.body.password){
        entity.updateAttributes({ password: req.body.password }).success(function(entity) {
          res.send({ message: "Senha alterada com sucesso!", error: 0 });
        });
      }else{
        res.send({ message: "Favor preencher todos os campos!", error: 2 });
      }
    } else {
      res.send({ message: "Usuário não encontrado!", error: 1 });
    }
  });
};

exports.dataProfile = function(req, res, next) {
  res.send({ name: req.user.name, email: req.user.email, error: 0 });
};
