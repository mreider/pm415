
exports.seed = function(knex, Promise) {
  return knex('statuses').del()
    .then(function () {
      return knex('statuses').insert([
        { owner_table: 'backlogs', id: 1, name: 'Unplanned' },
        { owner_table: 'backlogs', id: 2, name: 'Planned' },
        { owner_table: 'backlogs', id: 3, name: 'Doing' },
        { owner_table: 'backlogs', id: 4, name: 'Done' }
      ]);
    });
};
