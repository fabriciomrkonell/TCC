'use strict';

var db = require('../models');

exports.persist = function(req, res, next) {
  db.Equipment.find({ where: { token: req.param('token') } }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        res.send("0");
      }else{
        if((req.param('lat') != "" && req.param('lat') != null) && (req.param('lon') != "" && req.param('lon') != null)){
          db.Cords.create({
            lat: req.param('lat'),
            lon: req.param('lon'),
            history: entity.histoty,
            EquipmentId: entity.id
          }).success(function(data){
            res.send("1");
          }).error(function(error){
            res.send("0");
          });
        }else{
          res.send("0");
        }
      }
    } else {
      res.send("0");
    }
  });
};

exports.start = function(req, res, next) {
  db.Equipment.find({ where: { token: req.param('token') } }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        db.Cords.max('history').success(function(max){
          entity.updateAttributes({ history: ((max || 0) + 1)}).success(function(){
            res.send("1");
          });
        });
      }else{
        res.send("0");
      }
    } else {
      res.send("0");
    }
  });
};

exports.stop = function(req, res, next) {
  db.Equipment.find({ where: { token: req.param('token') } }).success(function(entity) {
    if (entity) {
      if(entity.history == 0){
        res.send("1");
      }else{
        entity.updateAttributes({ history: 0 }).success(function(){
          res.send("1");
        });
      }
    } else {
      res.send("0");
    }
  });
};