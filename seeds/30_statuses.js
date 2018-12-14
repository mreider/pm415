
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
        { owner_table: 'items', id: 4, name: 'Done' },
        { owner_table: 'initiatives', id: 9, name: 'Must have' },
        { owner_table: 'initiatives', id: 10, name: 'Should have' },
        { owner_table: 'initiatives', id: 11, name: 'Could have' },
        { owner_table: 'initiatives', id: 12, name: "Won't have" },
        { owner_table: 'bugs', id: 13, name: 'Will fix' },
        { owner_table: 'bugs', id: 14, name: 'Won\'t fix' },
        { owner_table: 'bugs', id: 15, name: 'Fixing' },
        { owner_table: 'bugs', id: 16, name: 'Fixed' }
      ]);
    });
};
