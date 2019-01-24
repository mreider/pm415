exports.seed = function(knex, Promise) {
  return knex('initiatives').del()
    .then(function () {
      return knex('initiatives').insert([
        {
          id: 1,
          title: 'aasdsadasdasdasdasd3',
          description: 'Test initiative descriprion',
          horizon: '2018-11-15',
          created_by: 3,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1,
          status_id: 11
        },
        {
          id: 2,
          title: '2 title',
          description: 'Test initiative descriprion 2',
          horizon: '2018-11-16',
          created_by: 2,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1,
          status_id: 10
        },
        {
          id: 3,
          title: '3 title',
          description: 'Test initiative descriprion 3',
          horizon: '2018-11-17',
          created_by: 3,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1,
          status_id: 9
        }
      ]);
    });
};

// (1, 'aasdsadasdasdasdasd3', 'Test idea descriprion', 2, '2018-11-15', 'impotant', 3, '2018-11-15 19:54:05', '2018-11-15 20:16:11', 1);
// (2, 'Api created', 'api created Description', 20, '2011-11-11', 'importance', 2, '2018-11-15 20:23:53', '2018-11-15 20:23:53', 1);
// (5, 'Api created', 'api created Description', 20, '2011-11-11', 'importance', 1, '2018-11-17 17:30:18', '2018-11-17 17:30:18', 1);
