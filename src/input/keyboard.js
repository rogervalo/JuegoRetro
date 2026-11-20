(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.keyboard = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function createInput(target) {
    var state = { left: false, right: false, fireRequested: false };

    function clear() {
      state.left = false;
      state.right = false;
      state.fireRequested = false;
    }

    function handle(event, pressed) {
      if (event.key === 'ArrowLeft') {
        state.left = pressed;
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        state.right = pressed;
        event.preventDefault();
      } else if (event.code === 'Space' || event.key === ' ') {
        if (pressed && !event.repeat) state.fireRequested = true;
        event.preventDefault();
      }
    }

    target.addEventListener('keydown', function (event) {
      handle(event, true);
    });
    target.addEventListener('keyup', function (event) {
      handle(event, false);
    });
    target.addEventListener('blur', clear);

    if (target.document) {
      target.document.addEventListener('visibilitychange', function () {
        if (target.document.hidden) clear();
      });
    }

    return { state: state, clear: clear };
  }

  return { createInput: createInput };
});
