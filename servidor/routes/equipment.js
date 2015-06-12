'use strict';

var db = require('../models'),
    util = require('../utils/util');

function isValid(equipment){
  if(equipment.description == "" || equipment.description == null){
    return false;
  }
  return true;
};

exports.persistEquipment = function(req, res, next) {
  db.Equipment.find({ where: { id: req.body.id } }).success(function(entity) {
    if (entity) {
      if(isValid(req.body)){
        entity.updateAttributes(req.body).success(function(entity) {
          res.send({ message: "Equipamento atualizado com sucesso!", error: 0 });
        });
      }else{
        res.send({ message: "Favor preencher todos os campos!", error: 2 });
      }
    } else {
      if(isValid(req.body)){
        var token = new util.generateRandom();
        token = token.generate();
        req.body.UserId = req.user.id;
        req.body.token = token;
        db.Equipment.create(req.body).success(function(entity) {
          res.send({ message: "Equipamento criado com sucesso!", error: 0 });
        });
      }else{
        res.send({ message: "Favor preencher todos os campos!", error: 2 });
      }
    }
  });
};

exports.persistEquipmentStatus = function(req, res, next) {
  db.Equipment.find({ where: { id: req.body.id } }).success(function(entity) {
    if (entity) {
      entity.updateAttributes({ status: !req.body.status }).success(function(entity) {
        res.send({ message: "Equipamento atualizado com sucesso!", error: 0 });
      });
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 1 });
    }
  });
};

exports.dataEquipment = function(req, res, next) {
  db.Equipment.findAll({ where: { UserId: req.user.id } }).success(function(entities) {
    res.send({ data: entities, error: 0 });
  });
};

exports.deleteEquipment = function(req, res, next) {
  db.Equipment.find({ where: { id: req.param('id') } }).success(function(entity) {
    if (entity) {
      entity.destroy().success(function() {
        res.send({ message: "Equipamento excluido com sucesso!", error: 0 });
      })
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 2 });
    }
  });
};