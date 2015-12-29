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
