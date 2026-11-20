(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.theme = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var theme = Object.freeze({
    background: '#05060f',
    grid: 'rgba(0, 240, 255, 0.07)',
    text: '#d9faff',
    cyan: '#00f0ff',
    magenta: '#ff2fb9',
    lime: '#b6ff3c',
    ship: '#00f0ff',
    invaders: ['#ff2fb9', '#b6ff3c', '#00f0ff'],
    bulletPlayer: '#b6ff3c',
    bulletEnemy: '#ff2fb9',
    powerUps: {
      double: '#b6ff3c',
      shield: '#00f0ff',
      life: '#ff2fb9'
    },
    boss: '#ff2fb9',
    bossCore: '#00f0ff',
    health: '#b6ff3c',
    healthBack: 'rgba(5, 8, 24, 0.85)',
    shield: '#00f0ff',
    scanline: 'rgba(0, 0, 0, 0.22)',
    glow: 14,
    font: '16px "Courier New", monospace'
  });

  return { theme: theme };
});
