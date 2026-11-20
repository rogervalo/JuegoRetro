(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.ship = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function createShip(config) {
    return {
      x: config.fieldWidth / 2,
      y: config.fieldHeight - 48,
      width: 38,
      height: 22,
      speed: config.shipSpeed
    };
  }

  function moveShip(ship, input, dt, config) {
    var direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    ship.x += direction * ship.speed * dt;

    var min = ship.width / 2;
    var max = config.fieldWidth - ship.width / 2;
    ship.x = Math.max(min, Math.min(max, ship.x));
    return ship;
  }

  return { createShip: createShip, moveShip: moveShip };
});
