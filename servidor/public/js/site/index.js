'use strict';

angular.module('app', []);

angular.module('app').controller('index', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      username: 'fabricioronchii@gmail.com',
      password: 'admin'
    }
  });

  $scope.login = function(){
    $http.post('/login', $scope.data).success(function(data){
      if(data.error == 0){
        window.location = '/home';
      }else{
        alert('Email ou senha inválidos!');
      }
    });
  };

}]);