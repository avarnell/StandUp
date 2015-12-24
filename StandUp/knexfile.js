// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: 'postgres://localhost/standup-development',
    pool: {
      min: 1,
      max: 1
    }
  },


  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
