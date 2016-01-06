var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development']);
var passport = require('passport');
var jwt = require('jwt-simple');
var headerCheck = require('./headerCheck')

//Get rid of
router.post('/signup', function(req,res,next){
  var passwordHash = bcrypt.hashSync( req.body.form.password, 8)
  var signupForm = req.body.form
  knex('organizations').insert({
    name: signupForm.orgName,
    code : signupForm.groupCode,
    passHash : passwordHash,
    API : signupForm.apiKey
  }).then(function(){
    res.json({status : "done"})
  })
})

//Modify
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
  console.log(req.body)
  knex('standUPs').insert({
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
router.post('/join', function(req,res,next){
  var joinForm = req.body.form
  knex('organizations').where({
    name: joinForm.orgName,
    code : joinForm.password
  }).then(function(response){
    res.send({id: response[0].id})
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
