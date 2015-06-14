'use strict';

var db = require('../models'),
    io = require('../server');

exports.get = function(socket, equipments) {
  if(socket){
    db.Equipment.findAll({
      include: {
        model: db.Cords,
        attributes: ['lat', 'lon'],
        where: {
          history: db.sequelize.col('Equipment.history')
        }
      },
      attributes: ['id', 'description', 'token'],
      where: {
        token: equipments,
        status: 1,
        history: {
          $ne: 0
        }
      }
    }).success(function(data){
      socket.emit('news_cords_all', data);
    });
  }
};

exports.persist = function(req, res, next) {
  db.Equipment.find({
    where: { token: req.param('token') },
    include: {
      model: db.User,
      attributes: ['socket'],
    }
  }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        res.send({ message: "Rastreamento não inicializado!", error: 1 });
      }else{
        if((req.param('lat') != "" && req.param('lat') != null) && (req.param('lon') != "" && req.param('lon') != null)){
          db.Cords.create({
            lat: req.param('lat'),
            lon: req.param('lon'),
            history: entity.history,
            EquipmentId: entity.id
          }).success(function(data){

            if(io.io.sockets.connected[entity.User.socket]){
              io.io.sockets.connected[entity.User.socket].emit('news_cords', {
                token: req.param('token'),
                lat: req.param('lat'),
                lon: req.param('lon')
              });
            }

            res.send({ message: "Coordenadas salva com sucesso!", error: 0 });
          });
        }else{
          res.send({ message: "Coordenadas inválidas!", error: 1 });
        }
      }
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 1 });
    }
  });
};

exports.start = function(req, res, next) {
  db.Equipment.find({ where: { token: req.param('token') } }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        db.Cords.max('history').success(function(max){
          entity.updateAttributes({ history: ((max || 0) + 1)}).success(function(){
            res.send({ message: "Rastreamento iniciado com sucesso!", error: 0 });
          });
        });
      }else{
        res.send({ message: "Rastreamento iniciado com sucesso!", error: 0 });
      }
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 1 });
    }
  });
};

exports.stop = function(req, res, next) {
  db.Equipment.find({ where: { token: req.param('token') } }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        res.send({ message: "Rastreamento parado com sucesso!", error: 0 });
      }else{
        entity.updateAttributes({ history: 0 }).success(function(){
          res.send({ message: "Rastreamento parado com sucesso!", error: 0 });
        });
      }
    } else {
      res.send({ message: "Equipamento não encontrado!", error: 1 });
    }
  });
};