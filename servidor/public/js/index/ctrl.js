'use strict';

angular.module('app', []);

angular.module('app').controller('ctrl', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      username: 'root',
      password: 'toor'
    }
  });

  $scope.entrar = function(){
    $http.post('/login', $scope.data).success(function(data){
      if(data.success){
        window.location = '/home';
      }else{
        alert('Email ou senha inválidos!');
      }
    }).error(function(error){
      alert('Erro ao fazer login!');
    });
  };

}]);