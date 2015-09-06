'use strict';

var db = require('../models');


exports.dataRoute = function(req, res, next) {
  db.Cords.findAll({
    attributes: ['id', 'history', 'createdAt'],
    where: {
      flag: true
    },
    include: [{
      model: db.Equipment,
      where: {
        UserId: req.user.id,
      }
    }]
  }).success(function(entities) {

    var retorno = [];

    for(var i = 0; i < entities.length; i++){
      if(entities[i].Equipment.history != entities[i].history){
        retorno.push(entities[i]);
      }
    }

    var retornoFinal = [];

    for(var i = 0; i < retorno.length; i++){
      for(var j = 0; j < retorno.length; j++){
        if(retorno[i].history == retorno[j].history && i < j){

          retornoFinal.push({
            CordsId: retorno[i].id,
            history: retorno[i].history,
            id: retorno[i].Equipment.id,
            description: retorno[i].Equipment.description,
            start: retorno[i].createdAt,
            finish: retorno[j].createdAt
          });

        }
      }
    }

    res.send({ data: retornoFinal, error: 0 });

  });
};

exports.dataRouteCords = function(req, res, next) {
  db.Cords.findAll({
    attributes: ['lat', 'lon'],
    where: {
      history: req.param('history'),
      flag: false
    },
    include: [{
      model: db.Equipment,
      where: {
        UserId: req.user.id,
      }
    }]
  }).success(function(entities) {

    res.send({ data: entities, error: 0 });

  });
};

exports.deleteRoute = function(req, res, next) {
  db.Cords.find({ where: { id: req.param('id') } }).success(function(entity) {
    if (entity) {
      db.Cords.destroy({
        where: {
          history: entity.history
        },
        include: [{
          model: db.Equipment,
          where: {
            UserId: entity.UserId,
          }
        }]
      }).success(function(entityAll) {
        res.send({ message: "Coordenadas excluidas com sucesso!", error: 0 });
      });
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 2 });
    }
  });
};