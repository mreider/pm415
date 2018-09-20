
exports.seed = function(knex, Promise) {
  return knex('organizations').del()
    .then(function () {
      return knex('organizations').insert([
        { id: 1, name: 'XYZ Software' },
        { id: 2, name: 'Opple' },
        { id: 3, name: 'Gaaglo' },
        { id: 4, name: 'Banana soft' },
        { id: 5, name: 'Software sale company' }
      ]);
    });
};
