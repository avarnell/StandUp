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
var SlackStrategy = require('passport-slack').Strategy
var http = require('http');
var app = express();
var jwt = require('jwt-simple')
var currentRoom;

//passport config
passport.use(new SlackStrategy({
  clientID: process.env.SLACKID,
  clientSecret: process.env.SLACKSECRET,
  scope : 'users:read,team:read,channels:read,chat:write:bot',
  redirect_uri : '/'
}, function(accessToken, refreshToken, profile, done) {
  var payload = {
    slackToken : accessToken,
    name : profile._json.user,
    created : new Date()
  },
  secret = process.env.JWTSECRET,
  JWToken = jwt.encode(payload, secret, 'HS512');
  

  knex('slackUsers').where({token : accessToken}).then(function(result){
    if(result.length == 0){
      return knex('slackUsers').insert({
          profilePic : profile._json.info.user.profile.image_32,
          name: profile._json.user ,
          url: profile._json.url,
          team: profile._json.team,
          team_id: profile._json.team_id,
          user_id: profile._json.user_id,
          token: accessToken,
          jwt : JWToken
        })
    }else{
      return knex('slackUsers').where({token : accessToken}).update({jwt:JWToken})
    }
  }).then(function(){
    profile.JWT = JWToken;
    return done(null, profile);
  })
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


//slash command intigration
app.post('/incoming', function(req,res,next){
  var slackPost = {}
  var eventType;
  var firstWord = req.body.text.split(' ')[0]
  firstWord = firstWord.toLowerCase()
  
  knex('slackUsers')
  .where({user_id : req.body.user_id})
  .then(function(result){
    if(result.length == 0){
      res.status(403).send('Please log in with the app to contribute.')      
    }else if(firstWord !== "help" && firstWord !== "event" && firstWord !== "interesting"){
      res.status(400).send('Please start your request with help, interesting or event.')
    }else{
      knex('standUPs')
      .where({channel_id : req.body.channel_id, isActive : true })
      .then(function(standUP){
        if(standUP.length == 0){
          res.status(402).send('You currently do not have an active standUP.')
        }else{
          currentRoom = standUP[0].id
          var oldStandup = standUP[0].standup;
          var inputText = req.body.text.split(" ")
          eventType = inputText.shift()
          eventType = eventType.toLowerCase()
          inputText = inputText.join(' ')
          slackPost.profilePic = result[0].profilePic;
          slackPost.user = req.body.user_name;
          slackPost.val = inputText
          slackPost.text =inputText.split("||")[0]
          slackPost.link = inputText.split('||')[1]

          if(eventType == 'help'){
            oldStandup.helps.push(slackPost)
          }else if(eventType == 'interesting'){
            oldStandup.interestings.push(slackPost)
          }else if(eventType == 'event'){
            oldStandup.events.push(slackPost)
          }else{
            res.status(200).send('Please start your post with help, interesting or event')
            
          }
          return oldStandup
        }
      }).then(function(oldStandup){
        return knex('standUPs').where({id : currentRoom}).update({standup : oldStandup})
      }).then(function(){
        io.to(currentRoom).emit(eventType, slackPost)
        res.status(200).send('Your contribution has been added')
      }) 
    }
  })
})

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
  //join room if session is active
  socket.on('join room', function(room){
    currentRoom = room
     if(currentRoom != 'demo'){
      knex('standUPs').where({id : room}).then(function(response){
        if(response[0].isActive){
          socket.join(currentRoom)
        }
      })
    }else{
      socket.join(currentRoom)
    }
  })

  //socket events for help, interesting and event
  socket.on('help', function(val, name, profilePic){
    var text = val.split('||')[0]
    var link = val.split('||')[1]
    var item = {val :val, user : name, profilePic: profilePic, link : link, text : text}

    io.to(currentRoom).emit('help', item)
    if(currentRoom != 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newHelp = data[0].standup
        newHelp.helps.push(item)
        return newHelp
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      })
    }
  })

  socket.on('interesting', function(val, name, profilePic){
    var text = val.split('||')[0]
    var link = val.split('||')[1]
    var item = {val :val, user : name, profilePic: profilePic, link : link, text : text}

    io.to(currentRoom).emit('interesting', item)
    if(currentRoom != 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newHelp = data[0].standup
        newHelp.interestings.push(item)
        return newHelp
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      })
    }
  })

  socket.on('event', function(val, name, profilePic){
    var text = val.split('||')[0]
    var link = val.split('||')[1]
    var item = {val :val, user : name, profilePic: profilePic, link : link, text : text}

    io.to(currentRoom).emit('event', item)
    if(currentRoom != 'demo'){
      knex('standUPs').where({
        id: currentRoom
      }).then(function(data){
        var newHelp = data[0].standup
        newHelp.events.push(item)
        return newHelp
      }).then(function(newobj){
        return knex('standUPs').where({
          id: currentRoom
        }).update({standup : newobj})
      })
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
