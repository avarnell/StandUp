var standUP = angular.module('standUP', ["ngRoute", 'btford.socket-io'])


.factory('mySocket',  function (socketFactory) {
  var socket = io.connect()
  var mySocket = socketFactory({
    ioSocket: socket
  });
  return mySocket
})

.controller('homeCtrl', ["$scope", function($scope){
  $scope.working = "Giddy-up"
}])

.controller('signUpCtrl', ['$scope', function($scope){

}])

.controller('demoCtrl', ['$scope', 'mySocket', function($scope, mySocket){
  $scope.helps = [];
  $scope.interestings = [];
  $scope.events = [];

  $scope.addHelp = function(){
    mySocket.emit('help', $scope.newHelp)
    $scope.newHelp = ""
  }
  mySocket.on('help', function(data){
    $scope.helps.push(data)
  })

  $scope.addInteresting = function(){
    mySocket.emit('interesting', $scope.newInteresting)
    $scope.newInteresting = ''
  }
  mySocket.on('interesting', function(data){
    $scope.interestings.push(data)
  })

  $scope.addEvent = function(){
    mySocket.emit('event', $scope.newEvent)
    $scope.newEvent = ""
  }
  mySocket.on('event', function(data){
    $scope.events.push(data)
  })

}])

.config(function ($routeProvider, $locationProvider){
  $routeProvider

  .when('/', {
    templateUrl: '../partials/home.html',
    controller: 'homeCtrl'
  })
  .when('/signup', {
    templateUrl: '../partials/signUp.html',
    controller: 'signUpCtrl'
  })
  .when('/join', {
    templateUrl: '../partials/join.html',
    controller: 'joinCtrl'
  })
  .when('/create', {
    templateUrl: '../partials/create.html',
    controller: 'createCtrl'
  })
  .when('/standUP/:id', {
    templateUrl: '../partials/standUP.html',
    controller: 'standUPCtrl'
  })
  .when('/moderator/:id', {
    templateUrl: '../partials/moderator.html',
    controller: 'moderatorCtrl'
  })
  .when('/demo', {
    templateUrl: '../partials/demo.html',
    controller: 'demoCtrl'
  })

  $locationProvider.html5Mode(true);
})