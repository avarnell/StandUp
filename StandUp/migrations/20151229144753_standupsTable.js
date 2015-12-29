
exports.up = function(knex, Promise) {
  return knex.schema.createTable('standUPs', function(table){
    table.increments();
    table.integer('org_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.json('standup').notNullable();
    table.boolean('isActive');
    table.dateTime('started');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('standUPs');
  
};

