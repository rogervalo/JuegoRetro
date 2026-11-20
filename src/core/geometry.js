(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.geometry = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function overlaps(a, b) {
    return Math.abs(a.x - b.x) * 2 < a.width + b.width &&
      Math.abs(a.y - b.y) * 2 < a.height + b.height;
  }

  return { overlaps: overlaps };
});
