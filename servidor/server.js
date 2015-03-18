'use strict';

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    path = require('path'),
    db = require('./models'),
    passport = require('passport'),
    flash = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    user = require('./routes/user'),
    route_passport = require('./routes/passport'),
    site = require('./routes/site'),
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
  res.send({ success: 2, message: 'Falha na autenticação!' });
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
  res.sendfile('public/index.html');
});

app.get('/home', isAuthenticated, function(req, res, next){
  site.home(req, res, next, null);
});

app.get('/profile', isAuthenticated, function(req, res, next){
  site.profile(req, res, next, null);
});

app.get('/newuser', isAuthenticated, function(req, res, next){
  site.newuser(req, res, next, null);
});

app.get('/realtime', isAuthenticated, function(req, res, next){
  site.realtime(req, res, next, null);
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
    res.json({ success: 1})
});

app.post('/newuser', isAuthenticated, user.persist)

db.sequelize.sync({ force: false }).complete(function(err) {
  if (err) {
    throw err
  } else {
    user.init();
    http.listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'))
    });
  }
});