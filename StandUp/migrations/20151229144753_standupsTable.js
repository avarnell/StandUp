
exports.up = function(knex, Promise) {
  return knex.schema.createTable('standUPs', function(table){
    table.increments();
    table.integer('org_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.json('standup').notNullable();
    table.boolean('isActive');
    table.timestamp('created_at').defaultTo(knex.fn.now());;
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('standUPs');
  
};

