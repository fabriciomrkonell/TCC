var db = require('../models'),
    site = require('../routes/site');

function isValid(user){
  if(!user.name){
    return false;
  }
  if(!user.email){
    return false;
  }
  if(!user.password){
    return false;
  }
  return true;
};

exports.init = function(){
  db.User.find( { where: {
    email: 'projeto-trator'
  }}).success(function(entity){
    if(entity){
      entity.updateAttributes({
        name: 'Administrador',
        email: 'root',
        password: 'toor',
        observation: ''
      }).success(function(entity) {
        console.log("Usuário atualizado com sucesso!");
      });
    }else{
      db.User.create({
        name: 'Administrador',
        email: 'root',
        password: 'toor',
        observation: ''
      }).success(function(entity) {
        console.log("Usuário criado com sucesso!");
      });
    }
  });
};

exports.persist = function(req, res, next) {
  db.User.find({ where: { email: req.body.email } }).success(function(entity) {
    if (entity) {
      site.newuser(req, res, next, "Já existe um usuário com esse email!", req.body);
    } else {
      if(isValid(req.body)){
        req.body.observation = '';
        db.User.create(req.body).success(function(entity) {
          site.newuser(req, res, next, "Usuário criado com sucesso!", {});
        });
      }else{
        site.newuser(req, res, next, "Favor preencher todos os campos!", req.body);
      }
    }
  })
};