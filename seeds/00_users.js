
exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        {
          id: 1,
          email: 'nosuchip@gmail.com',
          password: '090d91789d3a307a.10000.40d87db66e65dfabf6500cdabb127db965c55e797811d224f39b8958d2c52593674a2add6f67984a09e2ae8c1f32d010f1ab66f555df2a1d87589de19203750b10a7010104fefc26adcb1a0f240c6a67405157d26d0cd1bf8c40fc9291385f46a808f59f7a301fa25aaefdb57c4c49a0f896366e50f2e67118d8baed4b7d314f',
          first_name: 'Iddqd',
          last_name: 'Idkfa',
          is_active: 1,
          confirmed_at: '2018-09-20 10:05:03.051',
          created_at: '2018-09-20 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000'
        },
        {
          id: 2,
          email: 'zverozabr@yandex.ru',
          password: '8b115197eba18847.10000.b6aa63fce1b27a3d59cab86731a06d3153bec49515a5425af3d2e790b810009eddc7ace2e0b105ee8c462a937f110e74fa5a861ee105f709dc8975b10294aac9b487b76c1813a3f4a24fc782150b2a5e3fa7256382d778f090d25029a765d1b0a6e59368326ca72b73e0591c3978cadea9fd10cb55abbdbd8c4f3ac2f29f7131',
          first_name: 'Alex',
          last_name: 'Prilipko',
          is_active: 1,
          confirmed_at: '2018-09-19 10:05:03.051',
          created_at: '2018-09-18 10:04:55.000',
          updated_at: '2018-09-20 10:04:55.000'
        }
      ]);
    });
};
