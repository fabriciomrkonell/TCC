angular.module('starter', ['ionic']);

angular.module('starter').run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

angular.module('starter').constant('API', {
  isToken: 'http://localhost:3000/api/data-equipment-is-token/',
  startToken: 'http://localhost:3000/api/client_start?token=',
  stopToken: 'http://localhost:3000/api/client_stop?token='
});


angular.module('starter').controller('ctrl', ['$scope', '$ionicPopup', '$http', '$rootScope', 'API',function($scope, $ionicPopup, $http, $rootScope, API){

  var interval = setInterval(function(){
    navigator.geolocation.getCurrentPosition(function(pos){
      $scope.cords = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        date: new Date()
      };
      $scope.$digest();
    }, function(err){
      $scope.cords.lat = err;
    });
  }, 15000);

  $scope.data = {
    token: '',
  };

  $scope.cords = {
    lat: 0,
    lon: 0,
    date: new Date()
  };

  $rootScope.token =  null;

  $scope.isToken = function(button){
    if(angular.isObject($rootScope.token)){
      if(button == 'play'){
        if($rootScope.token.history == '0'){
          return true;
        }
        return false;
      }else if(button == 'stop'){
        if($rootScope.token.history == 0){
          return false;
        }
        return true;
      }else{
        return false;
      }
    }
    return false;
  };

  $scope.startToken = function(e){
    $http.get(API.startToken + $rootScope.token.token).success(function(data){
      if(data.error){
        alertToken(e, false);
      }else{
        $rootScope.token.history = data.data;
      }
    });
  };

  $scope.stopToken = function(e){
    $http.get(API.stopToken + $rootScope.token.token).success(function(data){
      if(data.error){
        alertToken(e, false);
      }else{
        clearInterval(interval);
        $rootScope.token.history = data.data;
      }
    });
  };

  $scope.setToken = function(){
    $ionicPopup.show({
      template: '<input type="text" ng-model="data.token" maxlength="5">',
      title: 'Token',
      subTitle: 'Digite o token do equipamento',
      scope: $scope,
      buttons: [
        { text: 'Cancelar',
          onTap: function(e) {
            if($rootScope.token){
              $scope.data.token = $rootScope.token.token;
            }else{
              $scope.data.token = '';
            }
          }
        },
        { text: 'Salvar',
          onTap: function(e) {
            if ($scope.data.token.length == 5) {
              $http.get(API.isToken + $scope.data.token).success(function(data){
                if(data.error){
                  alertToken(e, true);
                }else{
                  if(angular.isObject($rootScope.token) && ($rootScope.token.history > 0) && $rootScope.token.token != $scope.data.token){
                    alertToken(e, false, 'Existe um rastreamento em andamento!');
                    $scope.data.token = $rootScope.token.token;
                  }else{
                    $rootScope.token = data.data;
                  }
                }
              });
            }else{
              alertToken(e, false);
            }
          }
        }
      ]
    });
  };

  function alertToken(e, recursive, message){
    $ionicPopup.alert({
      title: message || 'Token inválido!',
      buttons: [
        { text: 'Ok',
          onTap: function(e) {
            if(recursive){
              $scope.setToken();
            }
          }
        }
      ]
    });
    e.preventDefault();
    e.stopPropagation();
  };

}]);