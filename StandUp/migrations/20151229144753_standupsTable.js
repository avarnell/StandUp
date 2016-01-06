
exports.up = function(knex, Promise) {
  return knex.schema.createTable('standUPs', function(table){
    table.increments();
    table.string('createdBy').notNullable();
    table.string('user_id').notNullable();
    table.string('team').notNullable();
    table.string('team_id').notNullable();
    table.string('channel_name').notNullable();
    table.string('channel_id').notNullable();
    table.json('standup').notNullable();
    table.boolean('isActive');
    table.timestamp('created_at').defaultTo(knex.fn.now());;
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('standUPs');
  
};

