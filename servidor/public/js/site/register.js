'use strict';

angular.module('app', []);

angular.module('app').controller('register', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      name: '',
      email: '',
      password: ''
    }
  });

  $scope.register = function(){
    $scope.data.username = $scope.data.email;
    $http.post('/api/register', $scope.data).success(function(data){
      alert(data.message);
      if(data.error == 0){
        window.location = '/';
      }
    });
  };

}]);