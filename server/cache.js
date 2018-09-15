module.exports = (function () {
  const cache = {};

  return {
    get: (key) => { return cache[key]; },

    set: (key, val) => { cache[key] = val; },

    cached: async (key, getter) => {
      if (typeof cache[key] === 'undefined' && cache !== null) {
        cache[key] = await getter();
      }

      return cache[key];
    }
  };
})();
