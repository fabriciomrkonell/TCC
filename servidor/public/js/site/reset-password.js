'use strict';

angular.module('app', []);

angular.module('app').controller('reset-password', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      email: ''
    }
  });

  $scope.resetPassword = function(){
    $http.post('/api/reset-password', $scope.data).success(function(data){
      alert(data.message);
      if(data.error == 0){
        window.location = "/";
      }
    });
  };

}]);