
exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(() => knex('users').insert([
      {
        id: 1,
        email: 'nosuchip@gmail.com',
        password: '0058d02bd6411940.10000.04d5938dd324df5c921f076b2bfe75f416b476ca1c7be8bfb8a1aad0b250f956e3c4004f086746a7689abee52a84c8194fa61c0e040deaa30ce8dda335d54968f5173fc7511c178ba377f5ec0a8a2dee8f8e3f55ad7527b18674ec1c553011adf430d423b52689f264cdbbaceb72555eccd0f23411348b0b4d563525866cdd34',
        first_name: 'Iddqd',
        last_name: 'Idkfa',
        is_active: true,
        confirmed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]));
};
