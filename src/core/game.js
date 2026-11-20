(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.game = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function dependencies() {
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
      return {
        ship: require('../entities/ship.js'),
        bullet: require('../entities/bullet.js'),
        formation: require('../entities/formation.js'),
        gameState: require('../state/game-state.js')
      };
    }
    return {
      ship: globalThis.JuegoIA.ship,
      bullet: globalThis.JuegoIA.bullet,
      formation: globalThis.JuegoIA.formation,
      gameState: globalThis.JuegoIA.gameState
    };
  }

  function overlaps(a, b) {
    return Math.abs(a.x - b.x) * 2 < a.width + b.width &&
      Math.abs(a.y - b.y) * 2 < a.height + b.height;
  }

  function compactBullets(bullets) {
    var write = 0;
    for (var i = 0; i < bullets.length; i += 1) {
      if (bullets[i].active) {
        bullets[write] = bullets[i];
        write += 1;
      }
    }
    bullets.length = write;
  }

  function start(state, config, best) {
    var fresh = dependencies().gameState.createGameState(config, best);
    Object.keys(fresh).forEach(function (key) {
      state[key] = fresh[key];
    });
    state.phase = 'playing';
    return state;
  }

  function restart(state, config) {
    return start(state, config, state.best);
  }

  function fire(state, config) {
    if (state.phase !== 'playing') return null;
    if (dependencies().bullet.hasActivePlayerBullet(state.bullets)) return null;
    var shot = dependencies().bullet.createBullet(
      'player', state.ship.x, state.ship.y - state.ship.height / 2 - 8, config
    );
    state.bullets.push(shot);
    return shot;
  }

  function updateBest(state) {
    if (state.score > state.best) state.best = state.score;
    return state.best;
  }

  function loseLife(state, config) {
    if (state.phase !== 'playing' || state.invulnerabilityLeft > 0) return false;
    state.lives -= 1;
    state.invulnerabilityLeft = config.invulnerabilityTime;
    if (state.lives <= 0) {
      state.lives = 0;
      state.phase = 'gameover';
      updateBest(state);
    } else {
      state.formation = dependencies().formation.createFormation(state.wave, config);
      state.bullets.length = 0;
    }
    return true;
  }

  function resolvePlayerShots(state, deps, config) {
    var enemies = state.formation.enemies;
    for (var i = 0; i < state.bullets.length; i += 1) {
      var shot = state.bullets[i];
      if (!shot.active || shot.owner !== 'player') continue;
      for (var j = 0; j < enemies.length; j += 1) {
        var enemy = enemies[j];
        if (!enemy.alive) continue;
        var target = {
          x: enemy.x + state.formation.offsetX,
          y: enemy.y + state.formation.offsetY,
          width: enemy.width,
          height: enemy.height
        };
        if (overlaps(shot, target)) {
          enemy.alive = false;
          shot.active = false;
          state.score += enemy.points;
          updateBest(state);
          break;
        }
      }
    }
  }

  function spawnEnemyShot(state, deps, config) {
    if (!deps.formation.consumeEnemyFire(state.formation, config)) return;
    var alive = [];
    for (var i = 0; i < state.formation.enemies.length; i += 1) {
      if (state.formation.enemies[i].alive) alive.push(state.formation.enemies[i]);
    }
    if (alive.length === 0) return;
    var index = Math.floor(state.elapsedTime * 10) % alive.length;
    var shooter = alive[index];
    state.bullets.push(deps.bullet.createBullet(
      'enemy',
      shooter.x + state.formation.offsetX,
      shooter.y + state.formation.offsetY + shooter.height / 2 + 8,
      config
    ));
  }

  function checkPlayerDamage(state, deps, config) {
    if (state.invulnerabilityLeft > 0 || state.phase !== 'playing') return;
    var ship = state.ship;
    for (var i = 0; i < state.bullets.length; i += 1) {
      var shot = state.bullets[i];
      if (shot.active && shot.owner === 'enemy' && overlaps(shot, ship)) {
        loseLife(state, config);
        return;
      }
    }
    for (var j = 0; j < state.formation.enemies.length; j += 1) {
      var enemy = state.formation.enemies[j];
      if (!enemy.alive) continue;
      var target = {
        x: enemy.x + state.formation.offsetX,
        y: enemy.y + state.formation.offsetY,
        width: enemy.width,
        height: enemy.height
      };
      if (overlaps(target, ship)) {
        loseLife(state, config);
        return;
      }
    }
  }

  function checkWaveProgress(state, deps, config) {
    var limits = deps.formation.bounds(state.formation);
    if (limits.lowest >= config.fieldHeight - 90) {
      loseLife(state, config);
      return;
    }
    var remaining = 0;
    for (var i = 0; i < state.formation.enemies.length; i += 1) {
      if (state.formation.enemies[i].alive) remaining += 1;
    }
    if (remaining === 0) {
      state.wave += 1;
      state.formation = deps.formation.createFormation(state.wave, config);
      state.bullets.length = 0;
    }
  }

  function step(state, input, dt, config) {
    if (state.phase !== 'playing') return state;
    var deps = dependencies();
    state.elapsedTime += dt;
    if (state.invulnerabilityLeft > 0) {
      state.invulnerabilityLeft = Math.max(0, state.invulnerabilityLeft - dt);
    }
    deps.ship.moveShip(state.ship, input, dt, config);
    deps.formation.stepFormation(state.formation, dt, config);
    if (input.fireRequested) {
      fire(state, config);
      input.fireRequested = false;
    }
    for (var i = 0; i < state.bullets.length; i += 1) {
      deps.bullet.advanceBullet(state.bullets[i], dt, config);
    }

    resolvePlayerShots(state, deps, config);
    spawnEnemyShot(state, deps, config);
    checkPlayerDamage(state, deps, config);
    if (state.phase === 'playing') checkWaveProgress(state, deps, config);
    compactBullets(state.bullets);
    return state;
  }

  return {
    start: start,
    restart: restart,
    fire: fire,
    updateBest: updateBest,
    loseLife: loseLife,
    step: step
  };
});
