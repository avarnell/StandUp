
var standUP = angular.module('standUP', ['chart.js',"ngRoute", 'btford.socket-io', 'LocalStorageModule'])

.controller('mainCtrl', ['$scope', '$rootScope','localStorageService','loggedIn', function($scope, $rootScope,localStorageService, loggedIn){
  function getItem(key) {
    return localStorageService.get(key);
  }

  var user = getItem('user')
  if(user !== null){
    $scope.name = user.data.data[0].name
  }
  else{
    $rootScope.notLoggedIn = $scope.notLoggedIn || true
  }
}])

.controller('homeCtrl', ["$scope", 'authFailed', function($scope, authFailed){
  $scope.failedAuth = authFailed.failed
  authFailed.reset()
  
}])

.controller('joinCtrl', ['$scope', '$http', '$location', 'localStorageService', 'authFailed', function($scope, $http, $location, localStorageService, authFailed){
  function getItem(key) {
    return localStorageService.get(key);
  }

  var user = getItem('user')
  if(user == null){
    authFailed.setauthFailed()
    $location.path('/')
  }else{
    $scope.team = user.data.data[0].team
    var slackToken = user.data.data[0].token
    var jwt = user.data.data[0].jwt
    $http.post('/join', { userToken : slackToken}, {headers: {Authorization : jwt}}).then(function(data){
      $scope.activeStandups = []
      $scope.inactiveStandups =[]
      data.data.standups.forEach(function(standup){
        if(standup.isActive == true){
          $scope.activeStandups.push(standup)
        }else{
          $scope.inactiveStandups.push(standup)
        }
      })
    })
  }
}])

.controller('createCtrl', ['$scope', '$http', '$location', '$routeParams','localStorageService','authFailed', function($scope, $http, $location, $routeParams, localStorageService, authFailed){
  function getItem(key) {
    return localStorageService.get(key);
  }
  $scope.audioEnabled = true
  var user = getItem('user')

  if(user == null){
    authFailed.setauthFailed()
    $location.path('/')
  }

  else{
    var slackToken = user.data.data[0].token
    $scope.channels = []
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
  }


  $scope.submitCreate = function(){
    $http.post('/create', {
      channel : $scope.form.channel,
      name : $scope.form.name,
      user: user.data.data[0]
    }, {headers : {Authorization : user.data.data[0].jwt}}).then(function(response){
      if(response.data.error){
        $scope.errorShow = true
        $scope.error = "/standUP/"+response.data.response[0].id
      }else{
        $location.path('/standUP/' + response.data.id)
      }

    })
  }

}])

.controller('standUPCtrl', [ '$timeout','$scope','mySocket', '$routeParams', '$http' , 'localStorageService', 'authFailed', '$location', function($timeout, $scope, mySocket,$routeParams, $http, localStorageService, authFailed, $location){
  var room = $routeParams.id
  function getItem(key) {
    return localStorageService.get(key);
  }
  var user = getItem('user')

  if(user == null){
    authFailed.setauthFailed()
    $location.path('/')
  }

  var name = user.data.data[0].name
  var profilePic = user.data.data[0].profilePic

  //Socket Logic
  mySocket.connect()

    mySocket.emit('join room', room)
    $http.get('/sync/' + room).then(function(data){
      $scope.team = data.data.standup.team
      $scope.channel = data.data.standup.channel_name
      $scope.helps = data.data.standup.standup.helps
      $scope.interestings = data.data.standup.standup.interestings
      $scope.events = data.data.standup.standup.events
      $scope.ended = !data.data.standup.isActive

    })


  $scope.addHelp = function(){
    mySocket.emit('help', $scope.newHelp, name, profilePic)
    $scope.newHelp = ""
  }
  mySocket.on('help', function(data){
    $scope.helps.push(data)
  })

  $scope.addInteresting = function(){
    mySocket.emit('interesting', $scope.newInteresting, name, profilePic)
    $scope.newInteresting = ''
  }
  mySocket.on('interesting', function(data){
    $scope.interestings.push(data)
  })

  $scope.addEvent = function(){
    mySocket.emit('event', $scope.newEvent, name , profilePic)
    $scope.newEvent = ""
  }
  mySocket.on('event', function(data){
    $scope.events.push(data)
  })

  $scope.endStandup = function(){
    $http.post('endStandup/' + room).then(function(response){
      $scope.ended = true;
      mySocket.emit('ended')
    })
  }


  //Speech Recognition Functionality
  if(!('webkitSpeechRecognition' in window)){
    alert("speech recognition is disabled for this browser, please use chrome if you would like to use this feature");
    $scope.audioEnabled = false
  }else{
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
  }

}])


.controller('demoCtrl', ['$scope','mySocket',  function($scope, mySocket){
  var room = "demo"
  $scope.helps = [];
  $scope.interestings = [];
  $scope.events = [];

  //Speech Recognition Functionality

  if(!('webkitSpeechRecognition' in window)){
    alert("speech recognition is disabled for this browser, please use chrome if you would like to use this feature");

  }else{

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

.controller('welcomeCtrl', ['$scope','$rootScope', '$routeParams', '$http', 'localStorageService', 'loggedIn', function($scope, $rootScope,$routeParams, $http, localStorageService, loggedIn){
  function submit(key, val) {
    return localStorageService.set(key, val);
  }
  $rootScope.notLoggedIn = false

  $http({
    url: '/users/me', 
    method: "GET",
    params: {jwt : $routeParams.jwt},
    headers : {Authorization : $routeParams.jwt }
  }).then(function(user){
    submit('user', user )
    $rootScope.name = user.data.data[0].name
  })
}])

.controller('logoutCtrl', ['$scope', '$rootScope', '$location', 'localStorageService', 'loggedIn', function($scope,$rootScope ,$location, localStorageService, loggedIn){
  function removeItem(key) {
    return localStorageService.remove(key);
  }
  removeItem('user')
  $rootScope.notLoggedIn = true
  $location.url('/')
}])

.controller('faqsCtrl', [function(){

}])

.controller('dataCtrl', ['$scope', '$http', '$routeParams', 'localStorageService', 'authFailed' , '$location',  function($scope, $http, $routeParams, localStorageService, authFailed, $location){
  
  function getItem(key) {
    return localStorageService.get(key);
  }
  var user = getItem('user')
  if(user === null){
    authFailed.setauthFailed()
    $location.path('/')
  }
  else if(user.data.data[0].team_id !== $routeParams.team){
    authFailed.setauthFailed()
    $location.path('/')
  }
  Chart.defaults.global.ids = []
  var jwt = user.data.data[0].jwt

  $http({
    url: '/getData', 
    method: "GET",
    params: {team_id: $routeParams.team,
      channelId : $routeParams.channel
    },
    headers : {Authorization : jwt}
  }).then(function(response){
    console.log(response.data)
    $scope.channelName = response.data.channelName
    $scope.labels = response.data.names
    $scope.series = ['Helps', 'Interestings', 'Events'] 
    $scope.data = [response.data.helpsCount, response.data.interestingsCount, response.data.eventsCount]
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
  })
}])


.config(function ($routeProvider, $locationProvider, localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('standUP')

  $routeProvider
  .when('/', {
    templateUrl: '../partials/home.html',
    controller: 'homeCtrl'
  })
  .when('/welcome', {
    templateUrl: '../partials/welcome.html',
    controller: 'welcomeCtrl'
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
  .when('/demo', {
    templateUrl: '../partials/demo.html',
    controller: 'demoCtrl'
  })
  .when('/logout', {
    templateUrl: '../partials/loggingOut.html',
    controller: 'logoutCtrl'
  })
  .when('/data/:team/:channel', {
    templateUrl: '../partials/data.html',
    controller: 'dataCtrl'
  })
  .when('/faqs', {
    templateUrl: '../partials/faqs.html',
    controller: 'faqsCtrl'
  })

  $locationProvider.html5Mode(true);
})
