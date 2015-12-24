var standUP = angular.module('standUP', ["ngRoute", 'btford.socket-io'])

.controller('homeCtrl', ["$scope", function($scope){
  $scope.working = "Giddy-up"
}])

.controller('signUpCtrl', ['$scope', function($scope){

}])

.controller('demoCtrl', ['$scope','mySocket', function($scope, mySocket){
  var room = "demo"
  $scope.helps = [];
  $scope.interestings = [];
  $scope.events = [];

  //Speech Recognition Functionality
  var recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US'
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = function (event) {
    console.log(event.results[0][0].transcript)
  };

  $scope.record = function(){
    recognition.start();
  }

  recognition.onresult = function (event) {
    var speech = event.results[0][0].transcript;
    if(speech[0] == "h"){
      speech = speech.split(" ")
      speech.shift()
      speech = speech.join(" ")
      $scope.newHelp = speech
    }
    else if(speech[0] == "i"){
      speech = speech.split(" ")
      speech.shift()
      speech = speech.join(" ")
      $scope.newInteresting = speech
    }
    else if(speech[0] == "e"){
      speech = speech.split(" ")
      speech.shift()
      speech = speech.join(" ")
      $scope.newEvent = speech
    }
    else{
      alert("I did not get that")
    }

    $scope.$digest()
  }
  

  //Socket fucntionality

  mySocket.on('connect', function(){
    mySocket.emit('join room', room)

  })

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