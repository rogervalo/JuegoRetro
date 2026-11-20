(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.screens = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function createScreens(options) {
    function showStart(best) {
      options.startBest.textContent = String(best);
      options.startScreen.classList.remove('hidden');
      options.gameoverScreen.classList.add('hidden');
    }

    function showGameOver(state, best) {
      options.finalScore.textContent = String(state.score);
      options.finalBest.textContent = String(best);
      options.gameoverScreen.classList.remove('hidden');
      options.startScreen.classList.add('hidden');
    }

    function hideAll() {
      options.startScreen.classList.add('hidden');
      options.gameoverScreen.classList.add('hidden');
    }

    function bindActions(onStart, onRestart) {
      options.startButton.addEventListener('click', onStart);
      options.restartButton.addEventListener('click', onRestart);
    }

    return {
      showStart: showStart,
      showGameOver: showGameOver,
      hideAll: hideAll,
      bindActions: bindActions
    };
  }

  return { createScreens: createScreens };
});
