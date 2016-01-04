require('dotenv').load()

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var knex = require('knex')(require('./knexfile')['development'])
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy
var SlackStrategy = require('passport-slack').Strategy
var http = require('http');
var app = express();
var session = require('express-session')


//passport config

passport.use(new SlackStrategy({
  clientID: process.env.SLACKID,
  clientSecret: process.env.SLACKSECRET,
  scope : 'users:read,team:read',
  redirect_uri : '/'
}, function(accessToken, refreshToken, profile, done) {
  var info = {profile : profile}
  return done(null, profile);
}
));


app.set('port', process.env.PORT || 3000);
var server = http.createServer(app);

var io = require('socket.io').listen(server);
server.listen(app.get('port'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());



app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//sockets

io.on('connection', function(socket){
  var currentRoom;

  //join room if session is active

  socket.on('join room', function(room){
    currentRoom = room
    knex('standUPs').where({id : room}).then(function(response){
      if(response[0].isActive){
        socket.join(currentRoom)
      }
    })
  })

  
  //socket events for help, interesting and event

  socket.on('help', function(val){
    if(currentRoom !== 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newHelp = data[0].standup
        newHelp.helps.push(val)
        return newHelp
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      }).then(function(results){
        io.to(currentRoom).emit('help', val)
      })
    }else{
      io.to(currentRoom).emit('help', val)
    }

  })

  socket.on('interesting', function(val){
    if(currentRoom !== 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newInteresting = data[0].standup
        newInteresting.interestings.push(val)
        return newInteresting
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      }).then(function(results){
        io.to(currentRoom).emit('interesting', val)
      })
    }else{
      io.to(currentRoom).emit('interesting', val)
    }
  })

  socket.on('event', function(val){
    if(currentRoom !== 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newEvent = data[0].standup
        newEvent.events.push(val)
        return newEvent
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      }).then(function(results){
        io.to(currentRoom).emit('event', val)
      })
    }else{
      io.to(currentRoom).emit('event', val)
    }
  })

  //disconnects all sockets when ended

  socket.on('ended', function(){
    io.sockets.sockets.forEach(function(s) {
      s.disconnect(true);
    });
  })

})


module.exports = app;
