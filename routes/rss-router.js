const Express = require('express');
const router = Express.Router();
const middlewares = require('../middlewares');
const Parser = require('rss-parser');
const Config = require('../config');

// get feed data
router.get('/', [middlewares.LoginRequired], async (req, res) => {
  const feedList = Config.feedList;

  if (feedList.length === 0) return res.json({ success: false, rss: [] });

  let parser = new Parser();
  let feedData = [];
  let todayDate = new Date();
  let weekDate = new Date();
  weekDate.setTime(todayDate.getTime() - (7 * 24 * 3600000));

  try {
    for (const element of feedList) {
      let feed = await parser.parseURL(element);
      let items = [];
      feed.items.forEach(element => {
        let elementDate = new Date(element.isoDate);
        if (elementDate > weekDate) items.push(element);
      });
      feedData.push({ name: feed.title, items });
    };
    return res.json({ success: true, rss: feedData });
  } catch (error) {
    return res.json({ success: false, rss: [] });
  }
});

module.exports = router;
