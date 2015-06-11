'use strict';

var db = require('../models');

exports.home = function(req, res, next) {
  res.render('views/home', {
    page: '/'
  });
};

exports.profile = function(req, res, next) {
  res.render('views/home', {
    page: '/profile',
    data: req.user
  });
};

exports.realtime = function(req, res, next) {
  res.render('views/home', {
    page: '/realtime'
  });
};

exports.equipment = function(req, res, next) {
  res.render('views/home', {
    page: '/equipment'
  });
};