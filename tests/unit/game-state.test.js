'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../../src/core/config.js');
const game = require('../../src/core/game.js');
const gameState = require('../../src/state/game-state.js');
const formation = require('../../src/entities/formation.js');
const boss = require('../../src/entities/boss.js');

function playing(best) {
  const state = gameState.createGameState(config, best || 0);
  game.start(state, config, best || 0);
  return state;
}

function controls() {
  return { left: false, right: false, fireRequested: false };
}

test('la nave se mueve y se detiene en los bordes', () => {
  const state = playing();
  const input = controls();
  input.left = true;
  for (let i = 0; i < 300; i += 1) {
    game.step(state, input, config.fixedStep, config);
  }
  assert.equal(state.ship.x, state.ship.width / 2);

  input.left = false;
  input.right = true;
  for (let i = 0; i < 400; i += 1) {
    game.step(state, input, config.fixedStep, config);
  }
  assert.equal(state.ship.x, config.fieldWidth - state.ship.width / 2);
});

test('perder una vida activa invulnerabilidad y bloquea impactos simultaneos', () => {
  const state = playing();
  const initialLives = state.lives;
  assert.equal(game.loseLife(state, config), true);
  assert.equal(state.lives, initialLives - 1);
  assert.equal(state.invulnerabilityLeft, config.invulnerabilityTime);
  assert.equal(game.loseLife(state, config), false);
  assert.equal(state.lives, initialLives - 1);
});

test('la ultima vida termina la partida y actualiza el record', () => {
  const state = playing(10);
  state.score = 123;
  state.lives = 1;
  game.loseLife(state, config);
  assert.equal(state.phase, 'gameover');
  assert.equal(state.lives, 0);
  assert.equal(state.best, 123);
});

test('la invulnerabilidad disminuye con el tiempo de simulacion', () => {
  const state = playing();
  game.loseLife(state, config);
  const initial = state.invulnerabilityLeft;
  game.step(state, controls(), config.fixedStep, config);
  assert.ok(state.invulnerabilityLeft < initial);
});

test('eliminar la formacion avanza de oleada y aumenta la velocidad', () => {
  const state = playing();
  const initialSpeed = state.formation.speed;
  state.formation.enemies.forEach((enemy) => {
    enemy.alive = false;
  });
  game.step(state, controls(), config.fixedStep, config);
  assert.equal(state.wave, 2);
  assert.equal(state.formation.wave, 2);
  assert.ok(state.formation.speed > initialSpeed);
});

test('un invasor que llega al fondo cuesta una vida y reinicia la formacion', () => {
  const state = playing();
  state.formation.offsetY = config.fieldHeight;
  game.step(state, controls(), config.fixedStep, config);
  assert.equal(state.lives, config.initialLives - 1);
  assert.equal(state.formation.offsetY, 0);
  assert.equal(state.wave, 1);
});

test('reiniciar conserva el record y devuelve el estado inicial', () => {
  const state = playing(80);
  state.score = 200;
  state.best = 200;
  state.wave = 4;
  state.lives = 1;
  state.phase = 'gameover';
  game.restart(state, config);
  assert.equal(state.phase, 'playing');
  assert.equal(state.score, 0);
  assert.equal(state.lives, config.initialLives);
  assert.equal(state.wave, 1);
  assert.equal(state.best, 200);
});

test('el escudo bloquea la perdida de vida', () => {
  const state = playing();
  state.effects.shield = config.shieldDuration;
  const lives = state.lives;
  assert.equal(game.loseLife(state, config), false);
  assert.equal(state.lives, lives);
  assert.equal(state.invulnerabilityLeft, 0);
});

test('reiniciar limpia efectos, power-ups y jefe', () => {
  const state = playing(80);
  state.effects.doubleShot = 5;
  state.effects.shield = 5;
  state.powerUps.push({ active: true });
  state.wave = 3;
  state.boss = boss.createBoss(3, config);
  game.restart(state, config);
  assert.equal(state.effects.doubleShot, 0);
  assert.equal(state.effects.shield, 0);
  assert.equal(state.powerUps.length, 0);
  assert.equal(state.boss, null);
  assert.equal(state.wave, 1);
});

test('la oleada 3 crea un jefe y una formacion vacia', () => {
  const state = playing();
  state.wave = 2;
  state.formation.enemies.forEach((enemy) => {
    enemy.alive = false;
  });
  game.step(state, controls(), config.fixedStep, config);
  assert.equal(state.wave, 3);
  assert.ok(state.boss);
  assert.equal(state.boss.wave, 3);
  assert.equal(state.formation.enemies.length, 0);
});

test('perder una vida en oleada de jefe conserva su vida', () => {
  const state = playing();
  state.wave = 3;
  state.formation = formation.createEmptyFormation(3, config);
  state.boss = boss.createBoss(3, config);
  state.boss.health = 10;
  const lives = state.lives;
  assert.equal(game.loseLife(state, config), true);
  assert.equal(state.lives, lives - 1);
  assert.equal(state.boss.health, 10);
  assert.equal(state.bullets.length, 0);
});
