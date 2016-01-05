var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development']);
var bcrypt = require('bcrypt');
var passport = require('passport');
var jwt = require('jwt-simple');
var headerCheck = require('./headerCheck')


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

router.post('/create', function(req,res,next){
  knex('organizations').where({
    name: req.body.orgName
  }).then(function(data){
    if(data.length == 0){
      res.json({auth: false})
    }else{
      if(bcrypt.compareSync(req.body.password, data[0].passHash)){
        knex('standUPs').insert({
          org_id : data[0].id,
          standup : {helps : [], interestings: [], events: []},
          isActive : true
        }).returning('id').then(function(standData){
          res.json({auth : true,
            id: standData[0]
          })
        })

      }else{
        res.json({auth: false})
      }
    }
  })
})

router.get('/sync/:id', function(req,res,next){
  var standup;
  var isActive;
  knex('standUPs').where({id : req.params.id}).then(function(data){
    standup = data[0].standup
    isActive = data[0].isActive
    return data[0].org_id
  }).then(function(orgid){
    return knex('organizations').where({id: orgid})
  }).then(function(orgName){
    res.json({name : orgName[0].name,
      standup : standup,
      isActive : isActive
    })
  })
})

router.post('/join', function(req,res,next){
  var joinForm = req.body.form
  knex('organizations').where({
    name: joinForm.orgName,
    code : joinForm.password
  }).then(function(response){
    res.send({id: response[0].id})
  })
})

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
