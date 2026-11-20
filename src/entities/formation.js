(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.formation = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function dependencies() {
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
      return { invader: require('./invader.js') };
    }
    return { invader: globalThis.JuegoIA.invader };
  }

  function createFormation(wave, config) {
    var speed = Math.min(
      config.waveSpeedBase * Math.pow(config.waveSpeedGrowth, wave - 1),
      config.waveSpeedMax
    );
    return {
      wave: wave,
      enemies: dependencies().invader.createInvaders(config),
      offsetX: 0,
      offsetY: 0,
      direction: 1,
      stepDown: Math.round(config.fieldHeight * 0.03),
      speed: speed,
      fireCooldown: config.enemyFireInterval
    };
  }

  function bounds(formation) {
    var min = Infinity;
    var max = -Infinity;
    var lowest = -Infinity;
    for (var i = 0; i < formation.enemies.length; i += 1) {
      var enemy = formation.enemies[i];
      if (!enemy.alive) continue;
      min = Math.min(min, enemy.x + formation.offsetX - enemy.width / 2);
      max = Math.max(max, enemy.x + formation.offsetX + enemy.width / 2);
      lowest = Math.max(lowest, enemy.y + formation.offsetY + enemy.height / 2);
    }
    if (min === Infinity) return { min: 0, max: 0, lowest: 0 };
    return { min: min, max: max, lowest: lowest };
  }

  function stepFormation(formation, dt, config) {
    var margin = 24;
    formation.offsetX += formation.direction * formation.speed * dt;

    var limits = bounds(formation);
    if (formation.direction > 0 && limits.max >= config.fieldWidth - margin) {
      formation.direction = -1;
      formation.offsetY += formation.stepDown;
      formation.offsetX -= limits.max - (config.fieldWidth - margin);
    } else if (formation.direction < 0 && limits.min <= margin) {
      formation.direction = 1;
      formation.offsetY += formation.stepDown;
      formation.offsetX += margin - limits.min;
    }

    formation.fireCooldown -= dt;
    return formation;
  }

  function consumeEnemyFire(formation, config) {
    if (formation.fireCooldown > 0) return false;
    formation.fireCooldown = config.enemyFireInterval;
    return true;
  }

  return {
    createFormation: createFormation,
    bounds: bounds,
    stepFormation: stepFormation,
    consumeEnemyFire: consumeEnemyFire
  };
});
