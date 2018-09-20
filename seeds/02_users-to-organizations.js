
exports.seed = function(knex, Promise) {
  return knex('users_organizations_roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('users_organizations_roles').insert([
        {user_id: 1, organization_id: 1},
        {user_id: 1, organization_id: 2}
      ]);
    });
};
