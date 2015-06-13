'use strict';

var db = require('../models');

exports.home = function(req, res, next) {
  res.render('views/home', {
    page: '/',
    count: 0
  });
};

exports.profile = function(req, res, next) {
  res.render('views/home', {
    page: '/profile',
    data: req.user,
    count: 0
  });
};

exports.realtime = function(req, res, next) {
  db.Equipment.count({
    where: {
      UserId: req.user.id,
      history: {
        $ne: 0
      }
    }
  }).success(function(count){
    console.log("--------------" + count + "----------------");
    res.render('views/home', {
      page: '/realtime',
      count: count
    });
  });
};

exports.equipment = function(req, res, next) {
  res.render('views/home', {
    page: '/equipment',
    count: 0
  });
};