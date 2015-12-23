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
  $scope.posts = [];

  $scope.send = function(){
    mySocket.emit('demo', $scope.test)
    $scope.test = ""
  }
  mySocket.on('demo', function(data){
    $scope.posts.push(data)
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