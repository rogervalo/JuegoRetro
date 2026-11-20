(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.config = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var config = Object.freeze({
    fieldWidth: 960,
    fieldHeight: 600,
    fixedStep: 1 / 60,
    shipSpeed: 420,
    bulletSpeed: 560,
    enemyFireInterval: 2.4,
    invulnerabilityTime: 1.5,
    waveSpeedBase: 34,
    waveSpeedGrowth: 1.1,
    waveSpeedMax: 110,
    formationRows: 5,
    formationCols: 10,
    initialLives: 3,
    maxRecord: 999999,
    powerUpDropChance: 0.15,
    powerUpFallSpeed: 90,
    powerUpSize: 26,
    maxPowerUps: 8,
    doubleShotDuration: 10,
    shieldDuration: 8,
    maxLives: 5,
    extraLifeBonus: 250,
    bossEvery: 3,
    bossBaseHealth: 40,
    bossHealthGrowth: 20,
    bossBasePoints: 500,
    bossPointsGrowth: 250,
    bossSpeed: 80,
    bossSpeedGrowth: 12,
    bossSpeedMax: 160,
    bossFireInterval: 2,
    bossFireIntervalStep: 0.18,
    bossFireIntervalMin: 0.9,
    bossWidth: 180,
    bossHeight: 96,
    bossTop: 120,
    leaderboardSize: 5,
    maxWave: 9999,
    randomSeed: 49746993
  });

  return { config: config };
});
