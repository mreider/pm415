exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        {
          id: 1,
          title: 'aasdsadasdasdasdasd3',
          description: 'Test initiative descriprion',
          popularity: 2,
          horizon: '2018-11-15',
          importance: 'important',
          created_by: 3,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1
        },
        {
          id: 2,
          title: '2 title',
          description: 'Test initiative descriprion 2',
          popularity: 20,
          horizon: '2018-11-16',
          importance: 'not important',
          created_by: 2,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1
        },
        {
          id: 3,
          title: '3 title',
          description: 'Test initiative descriprion 3',
          popularity: 20,
          horizon: '2018-11-17',
          importance: 'must have',
          created_by: 3,
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000',
          organization_id: 1
        }
      ]);
    });
};

// (1, 'aasdsadasdasdasdasd3', 'Test idea descriprion', 2, '2018-11-15', 'impotant', 3, '2018-11-15 19:54:05', '2018-11-15 20:16:11', 1);
// (2, 'Api created', 'api created Description', 20, '2011-11-11', 'importance', 2, '2018-11-15 20:23:53', '2018-11-15 20:23:53', 1);
// (5, 'Api created', 'api created Description', 20, '2011-11-11', 'importance', 1, '2018-11-17 17:30:18', '2018-11-17 17:30:18', 1);
