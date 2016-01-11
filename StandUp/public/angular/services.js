//write service for determining login
standUP.service('loggedIn', function(){
  var loggedIn = {}
  this.notLoggedIn = false

  loggedIn.setLoggedInTrue = function(){
    loggedIn.notLoggedIn = false
  }

  loggedIn.setLoggedInFalse = function(){
    loggedIn.notLoggedIn = true
  }

  return loggedIn
})