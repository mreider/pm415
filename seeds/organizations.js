
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('organizations').del()
    .then(() => knex('organizations').insert([
      {id: 1, name: 'XYZ Software', created_at: new Date(), updated_at: new Date()},
      {id: 2, name: 'Allies', created_at: new Date(), updated_at: new Date()}
    ]))
    .then(() => knex('users_organizations_roles').insert([
      {user_id: 1, organization_id: 1, created_at: new Date(), updated_at: new Date()},
      {user_id: 1, organization_id: 2, created_at: new Date(), updated_at: new Date()}
    ]));
};
