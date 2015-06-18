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

  var paths = {},
      service = new google.maps.DirectionsService(), poly;

  socket.on('new_socket', function(data){
    $http.post('api/persist-profile-socket', { socket: data });
  });

  function isPoly(data, map){
    if(paths[data.id] == null){
      paths[data.id] = {};
      paths[data.id].path = new google.maps.MVCArray();
      paths[data.id].poly = new google.maps.Polyline({ map: map, strokeColor: "#FF0000" });
    }
  }

  function initialize() {

    var myOptions = {
      zoom: 13,
      center: new google.maps.LatLng(-26.494561, -49.1048534),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      disableDefaultUI: true
    }

    var map = new google.maps.Map(document.getElementById("map"), myOptions);

    socket.on('news_cords_all', function(data){
      for(var i = 0; i < data.length; i++){

        //isPoly(data[i], map);

        for(var j = 0; j < (data[i].Cords.length - 1); j++){
          new google.maps.Marker({ position: new google.maps.LatLng(data[i].Cords[j].lat, data[i].Cords[j].lon), map: map, title: 'Hello World!' });
          //paths[data[i].id].path.push(new google.maps.LatLng(data[i].Cords[j].lat, data[i].Cords[j].lon));
        }

        //paths[data[i].id].poly.setPath(paths[data[i].id].path);
      }
    });

    socket.on('news_cords', function(data){
      //isPoly(data, map);
      //paths[data.id].path.push(new google.maps.LatLng(data.lat, data.lon));
      //paths[data.id].poly.setPath(paths[data.id].path);
    });

  }

  google.maps.event.addDomListener(window, 'load', initialize);

  /*
  var service = new google.maps.DirectionsService();
  service.route({
    origin: path.getAt(path.getLength() - 1),
    destination: evt.latLng,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  }, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
        path.push(result.routes[0].overview_path[i]);
      }
    }
  });
  */

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