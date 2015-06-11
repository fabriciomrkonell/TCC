'use strict';

angular.module('app', []);

function toggleDropdown(classDropDown){
  if(document.getElementById(classDropDown).classList.contains("open")){
    document.getElementById(classDropDown).classList.remove("open");
  }else{
    document.getElementById(classDropDown).classList.add("open");
  }
};

angular.module('app').controller('profile', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      name: '',
      email: '',
      password: ''
    }
  });

  $http.get('/api/data-profile').success(function(data){
    $scope.data = data;
  });

  $scope.save = function(){
    $http.post('/api/persist-profile', $scope.data).success(function(data){
      alert(data.message);
    });
  };

  $scope.savePassword = function(){
    $http.post('/api/persist-profile-password', $scope.data).success(function(data){
      alert(data.message);
      angular.extend($scope.data, {
        password: ''
      });
    });
  };

}]);

angular.module('app').controller('equipment', ['$scope', '$http', '$rootScope', 'Util', function($scope, $http, $rootScope, Util){

  angular.extend($scope, {
    data: {
      id: null,
      description: ''
    },
    flag: false
  });

  $scope.save = function(){
    $http.post('/api/persist-equipment', $scope.data).success(function(data){
      $scope.flag = false;
    });
  };

  $scope.edit = function(obj){
    angular.extend($scope.data, {
      id: obj.id,
      description: obj.description
    });
    $scope.flag = true;
  };

  $scope.delete = function(obj){
    $http.delete('/api/delete-equipment/' + obj.id).success(function(data){
      Util.getEquipments();
    });
  };

  $scope.$watch('flag', function(newValue, oldValue) {
    if(!newValue){
      Util.getEquipments();
      angular.extend($scope.data, {
        id: null,
        description: ''
      });
    }
  });

}]);

angular.module('app').config(['$interpolateProvider', '$httpProvider', function($interpolateProvider, $httpProvider){

  $httpProvider.interceptors.push(function($q) {
    return {
      response: function(response) {
        if(response.data.error == 2){
          alert(response.data.message);
          return $q.reject(response);
        }else if(response.data.error == 1){
          window.location = "/";
          return $q.reject(response);
        }
        return response;
      },
      responseError: function(response) {
        window.location = "/";
        return $q.reject(response);
      }
    };
  });

  return $interpolateProvider.startSymbol("((").endSymbol("))");
}]);

angular.module('app').run(['$rootScope', 'Util', function($rootScope, Util){
  Util.getEquipments();
}]);

angular.module('app').service('Util', ['$http', '$rootScope', function($http, $rootScope){
  this.getEquipments = function(){
    $http.get('/api/data-equipment').success(function(data){
      $rootScope.equipments = data.data;
    });
  }
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['app']);
});