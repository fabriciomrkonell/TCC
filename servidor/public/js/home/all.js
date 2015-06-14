'use strict';

angular.module('app', []);

var socket = null;

if(window.location.pathname == '/realtime'){
  socket = io();
}

angular.module('app').controller('profile', ['$scope', '$http', function($scope, $http){

  angular.extend($scope, {
    data: {
      name: '',
      email: '',
      password: ''
    }
  });

  $http.get('/api/data-profile').success(function(data){
    $scope.data = data.data;
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

angular.module('app').controller('realtime', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){

  var path = new google.maps.MVCArray(),
      service = new google.maps.DirectionsService(), poly;

  socket.on('news_cords_all', function(data){
    for(var i = 0; i < data[0].Cords.length; i++){
      path.push(new google.maps.LatLng(data[0].Cords[i].lat, data[0].Cords[i].lon));
    }
    poly.setPath(path);
  });

  socket.on('news_cords', function(data){
    path.push(new google.maps.LatLng(data.lat, data.lon));
    poly.setPath(path);
  });

  socket.on('new_socket', function(data){
    $http.post('api/persist-profile-socket', { socket: data });
  });

  function initialize() {

    var myOptions = {
      zoom: 13,
      center: new google.maps.LatLng(-26.494561, -49.1048534),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      disableDefaultUI: true
    }

    var map = new google.maps.Map(document.getElementById("map"), myOptions);
    poly = new google.maps.Polyline({ map: map, strokeColor: "#FF0000" });

    google.maps.event.addListener(map, "click", function(evt) {
      $http.get('/api/client_persist?token=ULlP7&lat=' + evt.latLng.A + '&lon=' + evt.latLng.F);
    });
  }

  google.maps.event.addDomListener(window, 'load', initialize);

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

  $rootScope.noEvent = function(e, obj){
    Util.setStatus(obj);
    e.stopPropagation();
  };

  $rootScope.realtime = function(e){
    if(window.location.pathname != "/realtime"){
      window.location = "/realtime";
    }
  };

  $rootScope.isRealTime = function(){
    if(window.location.pathname == "/realtime"){
      return true;
    }
    return false;
  };

  $rootScope.isStatus = function(index){
    if($rootScope.equipments[index].history > 0){
      return true;
    }
    return false;
  };

}]);

angular.module('app').service('Util', ['$http', '$rootScope', function($http, $rootScope){
  this.getEquipments = function(){
    $http.get('/api/data-equipment').success(function(data){
      $rootScope.equipments = data.data;

      var arrayEquipments  = [];
      for(var i = 0; i < data.data.length; i++){
        arrayEquipments.push(data.data[i].token);
      }

      socket.emit('equipments', { equipments: arrayEquipments, url: window.location.pathname });
    });
  },
  this.setStatus = function(obj){
    $http.post('/api/persist-equipment-status', obj);
  }
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['app']);
});