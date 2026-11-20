(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.loop = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function dependencies() {
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
      return { game: require('./game.js') };
    }
    return { game: globalThis.JuegoIA.game };
  }

  function markPrevious(state) {
    state.ship.prevX = state.ship.x;
    state.formation.prevOffsetX = state.formation.offsetX;
    state.formation.prevOffsetY = state.formation.offsetY;
    for (var i = 0; i < state.bullets.length; i += 1) {
      state.bullets[i].prevX = state.bullets[i].x;
      state.bullets[i].prevY = state.bullets[i].y;
    }
  }

  function audioSnapshot(state) {
    var playerBullets = 0;
    for (var i = 0; i < state.bullets.length; i += 1) {
      if (state.bullets[i].active && state.bullets[i].owner === 'player') {
        playerBullets += 1;
      }
    }
    return { score: state.score, lives: state.lives, playerBullets: playerBullets };
  }

  function createLoop(options) {
    var state = options.state;
    var config = options.config;
    var input = options.input;
    var renderer = options.renderer;
    var screens = options.screens;
    var store = options.store;
    var sound = options.sound || null;
    var best = options.best;
    var last = 0;
    var accumulator = 0;
    var gameOverHandled = false;
    var running = true;

    function beginPlay() {
      if (sound) sound.unlock();
      dependencies().game.start(state, config, best);
      accumulator = 0;
      last = 0;
      gameOverHandled = false;
      screens.hideAll();
    }

    function frame(timestamp) {
      if (!running) return;
      if (last === 0) last = timestamp;
      var elapsed = (timestamp - last) / 1000;
      last = timestamp;
      if (elapsed > 0.25) elapsed = 0.25;
      accumulator += elapsed;

      var steps = 0;
      while (accumulator >= config.fixedStep && steps < 5) {
        markPrevious(state);
        var before = sound ? audioSnapshot(state) : null;
        dependencies().game.step(state, input.state, config.fixedStep, config);
        if (sound) {
          var after = audioSnapshot(state);
          if (after.playerBullets > before.playerBullets) sound.shoot();
          if (after.score > before.score) sound.explode();
          if (after.lives < before.lives) sound.lifeLost();
        }
        accumulator -= config.fixedStep;
        steps += 1;
        if (state.phase === 'gameover' && !gameOverHandled) {
          gameOverHandled = true;
          var saved = store.save(state.best);
          best = saved.value;
          screens.showGameOver(state, best);
        }
      }
      if (steps === 5) accumulator = 0;

      renderer.render(state, accumulator / config.fixedStep);
      requestAnimationFrame(frame);
    }

    screens.bindActions(beginPlay, beginPlay);
    requestAnimationFrame(frame);

    return {
      begin: beginPlay,
      stop: function () {
        running = false;
      }
    };
  }

  return { createLoop: createLoop };
});
