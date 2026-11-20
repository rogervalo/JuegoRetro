'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../../src/core/config.js');
const game = require('../../src/core/game.js');
const gameState = require('../../src/state/game-state.js');
const bulletFactory = require('../../src/entities/bullet.js');

function playing() {
  const state = gameState.createGameState(config, 0);
  game.start(state, config, 0);
  return state;
}

function controls() {
  return { left: false, right: false, fireRequested: false };
}

test('un disparo del jugador elimina un invasor y suma puntos', () => {
  const state = playing();
  const enemy = state.formation.enemies[0];
  state.bullets.length = 0;
  state.bullets.push(
    bulletFactory.createBullet('player', enemy.x, enemy.y + state.formation.offsetY, config)
  );
  const previousScore = state.score;

  game.step(state, controls(), config.fixedStep, config);

  assert.equal(enemy.alive, false);
  assert.equal(state.score, previousScore + enemy.points);
  assert.equal(state.bullets.length, 0);
});

test('solo puede existir una salva activa del jugador', () => {
  const state = playing();
  const shots = game.fire(state, config);
  assert.equal(shots.length, 1);
  assert.equal(game.fire(state, config).length, 0);
  assert.equal(state.bullets.length, 1);
});

test('el disparo se libera al salir del campo', () => {
  const state = playing();
  const shots = game.fire(state, config);
  const shot = shots[0];
  shot.y = -30;
  shot.velocityY = -config.bulletSpeed;
  game.step(state, controls(), config.fixedStep, config);
  assert.equal(shot.active, false);
  assert.equal(game.fire(state, config).length, 1);
});

test('el disparo doble crea dos proyectiles y no supera la salva', () => {
  const state = playing();
  state.effects.doubleShot = config.doubleShotDuration;
  const shots = game.fire(state, config);
  assert.equal(shots.length, 2);
  assert.equal(game.fire(state, config).length, 0);
  assert.equal(state.bullets.length, 2);
});
