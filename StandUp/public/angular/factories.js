standUP.factory('mySocket',  function (socketFactory) {
  var socket = io.connect()
  var mySocket = socketFactory({
    ioSocket: socket
  });
  return mySocket
})

standUP.factory('authFailed', function(){
  var authFailed = {}

  authFailed.setauthFailed = function(){
    authFailed.failed = true
  }

  authFailed.reset = function(){
    authFailed.failed = false
  }

  return authFailed
})