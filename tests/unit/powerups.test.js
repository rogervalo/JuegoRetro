'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../../src/core/config.js');
const game = require('../../src/core/game.js');
const gameState = require('../../src/state/game-state.js');
const powerups = require('../../src/core/powerups.js');
const powerupEntity = require('../../src/entities/powerup.js');

function playing() {
  const state = gameState.createGameState(config, 0);
  game.start(state, config, 0);
  return state;
}

test('maybeDrop respeta la probabilidad y el tope de power-ups', () => {
  const state = playing();
  assert.equal(powerups.maybeDrop(state, 100, 100, config, 0.9), null);
  assert.equal(state.powerUps.length, 0);

  const dropped = powerups.maybeDrop(state, 100, 100, config, 0.1);
  assert.ok(dropped);
  assert.equal(state.powerUps.length, 1);
  assert.ok(powerupEntity.TYPES.includes(dropped.type));

  while (state.powerUps.length < config.maxPowerUps) {
    powerups.dropPowerUp(state, 10, 10, config, 'double');
  }
  assert.equal(powerups.maybeDrop(state, 10, 10, config, 0.1), null);
  assert.equal(state.powerUps.length, config.maxPowerUps);
});

test('un power-up cae y se desactiva al cruzar el borde inferior', () => {
  const powerUp = powerupEntity.createPowerUp('shield', 100, 10, config);
  for (let i = 0; i < 400; i += 1) {
    powerupEntity.advancePowerUp(powerUp, config.fixedStep, config);
  }
  assert.equal(powerUp.active, false);
  assert.ok(powerUp.y > config.fieldHeight);
});

test('recoger disparo doble activa y renueva su temporizador', () => {
  const state = playing();
  const first = powerups.dropPowerUp(state, state.ship.x, state.ship.y, config, 'double');
  powerups.advancePowerUps(state, 0, config);
  assert.equal(state.effects.doubleShot, config.doubleShotDuration);
  assert.equal(first.active, false);
  assert.equal(state.powerUps.length, 0);

  state.effects.doubleShot = 1;
  powerups.dropPowerUp(state, state.ship.x, state.ship.y, config, 'double');
  powerups.advancePowerUps(state, 0, config);
  assert.equal(state.effects.doubleShot, config.doubleShotDuration);
});

test('el escudo bloquea la perdida de vida mientras esta activo', () => {
  const state = playing();
  powerups.dropPowerUp(state, state.ship.x, state.ship.y, config, 'shield');
  powerups.advancePowerUps(state, 0, config);
  assert.equal(state.effects.shield, config.shieldDuration);

  const lives = state.lives;
  assert.equal(game.loseLife(state, config), false);
  assert.equal(state.lives, lives);
  assert.equal(state.invulnerabilityLeft, 0);
});

test('la vida extra suma una vida y bonifica al alcanzar el tope', () => {
  const state = playing();
  state.lives = config.initialLives;
  powerups.dropPowerUp(state, state.ship.x, state.ship.y, config, 'life');
  powerups.advancePowerUps(state, 0, config);
  assert.equal(state.lives, config.initialLives + 1);

  state.lives = config.maxLives;
  state.score = 0;
  state.best = 0;
  powerups.dropPowerUp(state, state.ship.x, state.ship.y, config, 'life');
  powerups.advancePowerUps(state, 0, config);
  assert.equal(state.lives, config.maxLives);
  assert.equal(state.score, config.extraLifeBonus);
  assert.equal(state.best, config.extraLifeBonus);
});

test('los efectos se decrementan con el paso y saturan en cero', () => {
  const state = playing();
  state.effects.doubleShot = config.doubleShotDuration;
  state.effects.shield = config.shieldDuration;

  powerups.updateEffects(state, config.fixedStep);
  assert.ok(state.effects.doubleShot < config.doubleShotDuration);
  assert.ok(state.effects.shield < config.shieldDuration);

  powerups.updateEffects(state, 100);
  assert.equal(state.effects.doubleShot, 0);
  assert.equal(state.effects.shield, 0);
});

test('el disparo doble crea dos proyectiles y bloquea una nueva salva', () => {
  const state = playing();
  state.effects.doubleShot = config.doubleShotDuration;
  const shots = game.fire(state, config);
  assert.equal(shots.length, 2);
  assert.equal(game.fire(state, config).length, 0);
  assert.equal(state.bullets.length, 2);
});
