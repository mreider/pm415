
exports.seed = function(knex, Promise) {
  return knex('statuses').del()
    .then(function () {
      return knex('statuses').insert([
        { owner_table: 'backlogs', id: 5, name: 'Unplanned' },
        { owner_table: 'backlogs', id: 6, name: 'Planned' },
        { owner_table: 'backlogs', id: 7, name: 'Doing' },
        { owner_table: 'backlogs', id: 8, name: 'Done' },
        { owner_table: 'items', id: 1, name: 'Unplanned' },
        { owner_table: 'items', id: 2, name: 'Planned' },
        { owner_table: 'items', id: 3, name: 'Doing' },
        { owner_table: 'items', id: 4, name: 'Done' }
      ]);
    });
};
