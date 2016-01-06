exports.up = function(knex, Promise) {
  return knex.schema.createTable('organizations', function(table){
    table.increments();
    table.string('name').notNullable().unique();
    table.string('code').notNullable();
    table.string('passHash').notNullable();
    table.string('API').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('organizations');
};
