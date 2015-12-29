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

/*
exports.up = function(knex, Promise) {
  return knex.schema.createTable('appearances', function (table) {
    table.increments();
    table.integer('movie_id').notNullable().references('id').inTable('movies').onDelete('CASCADE');
    table.integer('actor_id').notNullable().references('id').inTable('actors').onDelete('CASCADE');
    table.string('character').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('appearances');
};
*/