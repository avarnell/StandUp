var standUP = angular.module('standUP', ["ngRoute", 'btford.socket-io', 'LocalStorageModule'])

.controller('mainCtrl', ['$scope', 'localStorageService', function($scope, localStorageService){
  function getItem(key) {
    return localStorageService.get(key);
  }

  $scope.notLoggedIn = true

  var user = getItem('user')
  console.log(user)
  if(user !== null){
    $scope.notLoggedIn = false;
    $scope.name = user.data.data[0].name;
  }

}])

.controller('homeCtrl', ["$scope", function($scope){
  
}])

.controller('signUpCtrl', ['$scope','$http','$location', function($scope, $http, $location){

  $scope.submitSignUp = function(){
    $http.post('/signup', {form : $scope.form}).then(function(){
      $location.path('/')
    })
  }

}])

.controller('joinCtrl', ['$scope', '$http', '$location' ,function($scope, $http, $location){
  $scope.submitJoin = function(){
    $http.post('/join', {form : $scope.form}).then(function(response){
      $location.path('/organization/' + response.data.id)      
    })
  }

}])

.controller('createCtrl', ['$scope', '$http', '$location', '$routeParams','localStorageService', function($scope, $http, $location, $routeParams, localStorageService){
  function getItem(key) {
    return localStorageService.get(key);
  }
  var user = getItem('user')
  $scope.channels = []
  var slackToken = user.data.data[0].token

  $http.get('https://slack.com/api/channels.list?token='+slackToken ).then(function(response){
    response.data.channels.forEach(function(channel){
      if(channel.is_member == true){
        $scope.channels.push({
          channelName : channel.name,
          channelId : channel.id
        })
      }
    })
  })

  $scope.submitCreate = function(){
    $http.post('/create', {
      channel : $scope.form.channel,
      name : $scope.form.name,
      user: user.data.data[0]
    }, {headers : {Authorization : user.data.data[0].jwt}}).then(function(response){
      $location.path('/standUP/' + response.data.id)
      console.log(response)
    })
  }

}])

.controller('standUPCtrl', ['$scope','mySocket', '$routeParams', '$http' , function($scope, mySocket,$routeParams, $http){
  var room = $routeParams.id

  //Socket Logic

  mySocket.on('connect', function(){
    mySocket.emit('join room', room)
    $http.get('/sync/' + room).then(function(data){
      $scope.team = data.data.standup.team
      $scope.channel = data.data.standup.channel_name
      $scope.helps = data.data.standup.standup.helps
      $scope.interestings = data.data.standup.standup.interestings
      $scope.events = data.data.standup.standup.events
      $scope.ended = !data.data.standup.isActive
    })
  })

  $scope.addHelp = function(){
    mySocket.emit('help', $scope.newHelp)
    $scope.newHelp = ""
  }
  mySocket.on('help', function(data){
    console.log(data)
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

  $scope.endStandup = function(){
    $http.post('endStandup/' + room).then(function(response){
      console.log(response)
      $scope.ended = true;
      mySocket.emit('ended')
    })
  }
  
  //Speech Recognition Functionality
  var recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US'
  recognition.continuous = false;
  recognition.interimResults = false;

  $scope.record = function(){
    $scope.recording = true;
    recognition.start();
  }

  recognition.onaudioend = function(){
    $scope.recording = false;
    $scope.$apply()
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
    $scope.$apply()

  }

}])

.controller('orgPageCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
  
  $http.get('/orgPage/' + $routeParams.id).then(function(results){
    console.log(results) 
    $scope.orgName = results.data.org.name
    $scope.activeStandUPs = []
    $scope.inActiveStandUPs = []

    results.data.standups.forEach(function(standup){
      if(standup.isActive == true){
        $scope.activeStandUPs.push(standup)
      }else{
        $scope.inActiveStandUPs.push(standup)
      }
    })

    if($scope.activeStandUPs.length == 0){
      $scope.noActive = true
    }

  })

}])

.controller('demoCtrl', ['$scope','mySocket',  function($scope, mySocket){
  var room = "demo"
  $scope.helps = [];
  $scope.interestings = [];
  $scope.events = [];

  //Speech Recognition Functionality
  var recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US'
  recognition.continuous = false;
  recognition.interimResults = false;

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

.controller('welcomeCtrl', ['$scope', '$routeParams', '$http', 'localStorageService', function($scope, $routeParams, $http, localStorageService){
  function submit(key, val) {
    return localStorageService.set(key, val);
  }

  $http.defaults.headers.common.Authorization = $routeParams.jwt
  $http({
    url: '/users/me', 
    method: "GET",
    params: {jwt : $routeParams.jwt }
  }).then(function(user){
    submit('user', user )
    console.log(user.data.data[0])
    $scope.user = user.data.data[0].name
  })
}])

.controller('logoutCtrl', ['$scope', '$location', 'localStorageService', function($scope, $location, localStorageService){
  function removeItem(key) {
    return localStorageService.remove(key);
  }
  removeItem('user')
  $location.path('/')
}])


.config(function ($routeProvider, $locationProvider, localStorageServiceProvider){
  localStorageServiceProvider
    .setPrefix('standUP')

  $routeProvider
  .when('/', {
    templateUrl: '../partials/home.html',
    controller: 'homeCtrl'
  })
  .when('/welcome', {
    templateUrl: '../partials/welcome.html',
    controller: 'welcomeCtrl'
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
  .when('/organization/:id', {
    templateUrl: '../partials/orgPage.html',
    controller: 'orgPageCtrl'
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
  .when('/logout', {
    templateUrl: '../partials/loggingOut.html',
    controller: 'logoutCtrl'
  })

  $locationProvider.html5Mode(true);
})