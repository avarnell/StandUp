standUP.factory('mySocket',  function (socketFactory) {
  var socket = io.connect()
  var mySocket = socketFactory({
    ioSocket: socket
  });
  return mySocket
})