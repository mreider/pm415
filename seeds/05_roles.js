
exports.seed = function(knex, Promise) {
  return knex('roles').del()
    .then(function () {
      return knex('roles').insert([
        {id: 1, role: 'Admin'},
        {id: 2, role: 'Member'},
        {id: 3, role: 'Pending'}
      ]);
    });
};
