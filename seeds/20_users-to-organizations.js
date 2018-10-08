
exports.seed = function(knex, Promise) {
  return knex('users_organizations_roles').del()
    .then(function () {
      return knex('users_organizations_roles').insert([
        { user_id: 1, organization_id: 1, role_id: 2 },
        { user_id: 1, organization_id: 2, role_id: 1 },
        { user_id: 2, organization_id: 1, role_id: 1 },
        { user_id: 2, organization_id: 2, role_id: 2 },
        { user_id: 2, organization_id: 3, role_id: 2 }
      ]);
    });
};
