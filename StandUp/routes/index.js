var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development']);
var passport = require('passport');
var jwt = require('jwt-simple');
var headerCheck = require('./headerCheck')
var request = require('request')

//protected
router.post('/create', headerCheck, function(req,res,next){
  var channel_name = req.body.channel.channelName

  knex('standUPs').where({
    channel_id : req.body.channel.channelId,
    isActive : true
  }).then(function(response){
    if(response.length > 0){
      res.json({error: 'There is already an active standUP',
      response: response})
    }else{
      knex('standUPs').insert({
        standup_name: req.body.name,
        createdBy: req.body.user.name,
        user_id: req.body.user.user_id,
        team: req.body.user.team,
        team_id : req.body.user.team_id,
        channel_name: req.body.channel.channelName,
        channel_id: req.body.channel.channelId,
        standup: {helps : [], interestings: [], events: []},
        isActive: true
      }).returning('id').then(function(standData){
        var joinString = 'A new standUP has been created. Join ' + req.body.name + ' at http://b832a90c.ngrok.io/ and sign in!'
        request.get('https://slack.com/api/chat.postMessage?token='+ req.body.user.token + '&channel=%23' + channel_name + '&text=' + joinString)
        res.json({id: standData[0]})
      })
    }
  })


 
})


//goodish, i think its fine
router.get('/sync/:id', function(req,res,next){
  knex('standUPs').where({id : req.params.id}).then(function(data){
    res.json({standup : data[0]})
  })
})

//protected
router.post('/join', headerCheck,function(req,res,next){
  knex('slackUsers').where({token:req.body.userToken}).then(function(user){
    return knex('standUPs').where({team_id : user[0].team_id})
  }).then(function(result){
    var standups = []
    result.forEach(function(standup){
      standups.push({
        name : standup.standup_name,
        id : standup.id,
        createdBy: standup.createdBy,
        team : standup.team,
        team_id : standup.team_id,
        channel_name : standup.channel_name,
        channel_id: standup.channel_id,
        isActive : standup.isActive,
        created_at : standup.created_at
      })
    })
    res.json({standups : standups})
  })
})

//good
router.post('/endStandup/:id', function(req,res,next){
  knex('standUPs').where({id : req.params.id}).update({isActive : false}).then(function(){
    res.json({update : true})
  })
})

router.get('/login', passport.authenticate('slack'), function(req, res) {

});

router.get('/auth/redirect', passport.authenticate('slack', {failureRedirect: '/' , 'session' : false}), function(req,res,next){
  res.redirect('/welcome?jwt='+req.user.JWT)
})

//protected
router.get('/users/me/', headerCheck ,function(req, res,next){
  res.json({data:req.userdata})
})

router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public'
  })
});




module.exports = router;
