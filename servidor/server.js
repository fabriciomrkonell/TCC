'use strict';

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    path = require('path'),
    db = require('./models'),
    passport = require('passport'),
    flash = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    route_passport = require('./routes/passport'),
    site = require('./routes/site'),
    home = require('./routes/home'),
    util = require('./routes/util'),
    router_profile  = require('./routes/profile'),
    router_equipment  = require('./routes/equipment'),
    swig = require('swig');

app.set('port', process.env.PORT || 3000)
app.set('view cache', false);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser())
app.engine('html', swig.renderFile);
swig.setDefaults({ cache: false });

app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'rastreamento' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

if ('development' === app.get('env')) {
  app.use(errorHandler())
}

function isAuthenticatedPage(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.send({ error: 0, message: 'Falha na autenticação!' });
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  route_passport.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      route_passport.findByEmail(username, password, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user == null) {
          return done(null, null);
        }
        return done(null, user);
      })
    });
  }
));

app.get('/', function(req, res, next){
  res.sendfile('public/views/site/index.html');
});

app.get('/register', function(req, res, next){
  res.sendfile('public/views/site/register.html');
});

app.get('/reset-password', function(req, res, next){
  res.sendfile('public/views/site/reset-password.html');
});

app.get('/home', isAuthenticated, function(req, res, next){
  home.home(req, res, next);
});

app.get('/profile', isAuthenticated, function(req, res, next){
  home.profile(req, res, next);
});

app.get('/equipment', isAuthenticated, function(req, res, next){
  home.equipment(req, res, next);
});

app.get('/realtime', isAuthenticated, function(req, res, next){
  home.realtime(req, res, next);
});

app.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }), function(req, res, next) {
    res.json({ error: 0 })
});

// Site
app.post('/api/register', site.register);
app.post('/api/reset-password', site.resetPassword);

// Client
app.get('/api/client_persist', util.persist);
app.get('/api/client_start', util.start);
app.get('/api/client_stop', util.stop);

// Profile
app.get('/api/data-profile', isAuthenticatedPage, router_profile.dataProfile);
app.post('/api/persist-profile', isAuthenticatedPage, router_profile.persistProfile);
app.post('/api/persist-profile-socket', isAuthenticatedPage, router_profile.persistProfileSocket);
app.post('/api/persist-profile-password', isAuthenticatedPage, router_profile.persistProfilePassword);

// Equipment
app.get('/api/data-equipment', isAuthenticatedPage, router_equipment.dataEquipment);
app.post('/api/persist-equipment', isAuthenticatedPage, router_equipment.persistEquipment);
app.post('/api/persist-equipment-status', isAuthenticatedPage, router_equipment.persistEquipmentStatus);
app.delete('/api/delete-equipment/:id', isAuthenticatedPage, router_equipment.deleteEquipment);

db.sequelize.sync({ force: false }).complete(function(err) {
  if (err) {
    throw err
  } else {
    http.listen(app.get('port'), function(){

      console.log('Express server listening on port ' + app.get('port'))

      io.on('connection', function(socket){

        socket.on('equipments', function(obj){
          if(obj.url == "/realtime"){
            util.get(socket, obj.equipments);
            socket.emit('new_socket', socket.id);
          }
        });

      });

    });
  }
});

module.exports.io = io;