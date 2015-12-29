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
    res.send("done")
  })
  
})


router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public'
  })
});


module.exports = router;
