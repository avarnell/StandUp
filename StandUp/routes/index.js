var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development'])
var bcrypt = require('bcrypt')



/* GET home page. */

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
          standup : {helps : [], interstings: [], events: []},
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



router.post('/join', function(req,res,next){
  var joinForm = req.body.form

  knex('organizations').where({
    name: joinForm.orgName,
    code : joinForm.password
  }).then(function(response){
    res.send({id: response[0].id})
  })
})

router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public'
  })
});


module.exports = router;
