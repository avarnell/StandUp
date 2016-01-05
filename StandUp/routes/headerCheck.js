var knex = require('knex')(require('../knexfile')['development']);

function headerCheck(req, res, next){

  if(!req.headers.authorization){
    return res.sendStatus(403)
  }
  
  console.log(req.headers.authorization + " HEADER")

  knex('slackUsers').where({
    jwt : req.headers.authorization 
  }).then(function(user){

    if(user.length !== 0){
      req.userdata = user
      next()
    } else return res.sendStatus(403)
  })
  
}

module.exports = headerCheck