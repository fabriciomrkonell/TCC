exports.home = function(req, res, next, message) {
  res.render('views/default/index', {
    page: '/',
    message: message
  });
};

exports.profile = function(req, res, next, message) {
  res.render('views/default/index', {
    page: '/profile',
    data: req.user,
    message: message
  });
};

exports.newuser = function(req, res, next, message, data) {
  res.render('views/default/index', {
    page: '/newuser',
    data: data,
    message: message
  });
};

exports.realtime = function(req, res, next, message) {
  res.render('views/default/index', {
    page: '/realtime',
    message: message
  });
};