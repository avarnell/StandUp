var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development']);
var passport = require('passport');
var jwt = require('jwt-simple');
var headerCheck = require('./headerCheck')


//Modify, or just remove
router.get('/orgPage/:id', function(req,res,next){
  var orgInfo;
  knex('organizations').where({
    id: req.params.id
  })
  .then(function(info){
    orgInfo = info
    return knex('standUPs').where({
      org_id : req.params.id
    })
  }).then(function(standUPs){
    res.json({
      org : orgInfo[0],
      standups : standUPs
    })
  })
})

//protected
router.post('/create', headerCheck, function(req,res,next){
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
    res.json({auth : true,
      id: standData[0]
    })
  })
})


//goodish
router.get('/sync/:id', function(req,res,next){
  knex('standUPs').where({id : req.params.id}).then(function(data){
    res.json({standup : data[0]})
  })
})

//need to rewrite
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

router.get('/auth/redirect', passport.authenticate('slack', { failureRedirect: '/login' , 'session' : false}), function(req,res,next){
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
