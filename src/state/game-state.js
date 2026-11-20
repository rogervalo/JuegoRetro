(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.gameState = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function dependencies() {
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
      return {
        ship: require('../entities/ship.js'),
        formation: require('../entities/formation.js')
      };
    }
    return {
      ship: globalThis.JuegoIA.ship,
      formation: globalThis.JuegoIA.formation
    };
  }

  function createGameState(config, best) {
    var deps = dependencies();
    return {
      phase: 'start',
      score: 0,
      best: best || 0,
      lives: config.initialLives,
      wave: 1,
      ship: deps.ship.createShip(config),
      formation: deps.formation.createFormation(1, config),
      boss: null,
      bullets: [],
      powerUps: [],
      effects: { doubleShot: 0, shield: 0 },
      rngState: config.randomSeed >>> 0,
      invulnerabilityLeft: 0,
      elapsedTime: 0
    };
  }

  return { createGameState: createGameState };
});
