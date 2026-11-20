(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.record = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var KEY = 'juegoia.space-invaders.best';

  function normalize(value, config) {
    var number = Number(value);
    if (!Number.isFinite(number) || !Number.isInteger(number)) return null;
    if (number < 0 || number > config.maxRecord) return null;
    return number;
  }

  function createRecordStore(storage, config) {
    var memory = 0;
    var available = Boolean(storage);

    function load() {
      if (!available) return { value: memory, storageAvailable: false };
      var raw;
      try {
        raw = storage.getItem(KEY);
      } catch (error) {
        available = false;
        return { value: memory, storageAvailable: false };
      }
      var value = raw === null ? 0 : normalize(raw, config);
      memory = value === null ? 0 : value;
      return { value: memory, storageAvailable: true };
    }

    function save(value) {
      var valid = normalize(value, config);
      if (valid === null || valid <= memory) {
        return { value: memory, storageAvailable: available };
      }
      memory = valid;
      if (!available) return { value: memory, storageAvailable: false };
      try {
        storage.setItem(KEY, String(memory));
      } catch (error) {
        available = false;
        return { value: memory, storageAvailable: false };
      }
      return { value: memory, storageAvailable: true };
    }

    return { load: load, save: save };
  }

  return { KEY: KEY, normalize: normalize, createRecordStore: createRecordStore };
});
