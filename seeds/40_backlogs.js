
exports.seed = function(knex, Promise) {
  return knex('backlogs').del()
    .then(function () {
      return knex('backlogs').insert([
        { assignee: 1, id: 1, title: '1 backlog', description: '1 backlog description', status_id: 1, points: '10', deleted: 0, created_by: 1, organization_id: 1 },
        { assignee: 2, id: 2, title: '2 backlog', description: '2 backlog description', status_id: 2, points: '20', deleted: 0, created_by: 2, organization_id: 1 },
        { assignee: 3, id: 3, title: '3 backlog', description: '3 backlog description', status_id: 3, points: '30', deleted: 0, created_by: 3, organization_id: 1 },
        { assignee: 1, id: 4, title: '4 backlog', description: '4 backlog description', status_id: 1, points: '10', deleted: 0, created_by: 1, organization_id: 2 },
        { assignee: 2, id: 5, title: '5 backlog', description: '5 backlog description', status_id: 2, points: '20', deleted: 0, created_by: 2, organization_id: 2 },
        { assignee: 3, id: 6, title: '6 backlog', description: '6 backlog description', status_id: 3, points: '30', deleted: 0, created_by: 3, organization_id: 2 },
        { assignee: 1, id: 7, title: '7 backlog', description: '7 backlog description', status_id: 1, points: '10', deleted: 0, created_by: 1, organization_id: 3 },
        { assignee: 2, id: 8, title: '8 backlog', description: '8 backlog description', status_id: 2, points: '20', deleted: 0, created_by: 2, organization_id: 3 },
        { assignee: 3, id: 9, title: '9 backlog', description: '9 backlog description', status_id: 3, points: '30', deleted: 0, created_by: 3, organization_id: 3 }
      ]);
    });
};
