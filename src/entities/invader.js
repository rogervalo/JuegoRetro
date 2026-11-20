(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.invader = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function pointsForRow(row) {
    if (row < 2) return 30;
    if (row < 4) return 20;
    return 10;
  }

  function createInvaders(config) {
    var enemies = [];
    var spacing = (config.fieldWidth - 160) / config.formationCols;
    var width = Math.round(spacing * 0.62);
    var height = Math.round(width * 0.72);
    var left = (config.fieldWidth - (config.formationCols - 1) * spacing) / 2;
    var top = 72;
    var id = 1;

    for (var row = 0; row < config.formationRows; row += 1) {
      for (var col = 0; col < config.formationCols; col += 1) {
        enemies.push({
          id: id,
          x: left + col * spacing,
          y: top + row * spacing * 0.72,
          width: width,
          height: height,
          alive: true,
          points: pointsForRow(row),
          kind: row % 3
        });
        id += 1;
      }
    }
    return enemies;
  }

  return { createInvaders: createInvaders };
});
