
exports.up = function(knex, Promise) {
  return knex.raw(`RENAME TABLE ideas TO initiatives;`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`RENAME TABLE initiatives TO ideas;`);
};
