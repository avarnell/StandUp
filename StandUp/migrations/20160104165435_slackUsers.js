exports.up = function(knex, Promise) {
  return knex.schema.createTable('slackUsers', function(table){
    table.increments();
    table.string('profilePic').notNullable();
    table.string('name').notNullable();
    table.string('url').notNullable();
    table.string('team').notNullable();
    table.string('team_id').notNullable();
    table.string('user_id').notNullable();
    table.string('token').notNullable();
    table.string('jwt', [500]).notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('slackUsers');
};

