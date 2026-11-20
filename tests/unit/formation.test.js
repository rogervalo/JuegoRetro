'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../../src/core/config.js');
const formation = require('../../src/entities/formation.js');

test('la velocidad crece por oleada y respeta el techo', () => {
  const first = formation.createFormation(1, config);
  const third = formation.createFormation(3, config);
  const late = formation.createFormation(200, config);
  assert.equal(first.speed, config.waveSpeedBase);
  assert.ok(third.speed > first.speed);
  assert.equal(late.speed, config.waveSpeedMax);
});

test('la formacion barre lateralmente con el paso fijo', () => {
  const group = formation.createFormation(1, config);
  const before = group.offsetX;
  formation.stepFormation(group, config.fixedStep, config);
  assert.ok(Math.abs(group.offsetX - before - group.speed * config.fixedStep) < 1e-9);
});

test('al llegar al borde invierte direccion y baja un escalon', () => {
  const group = formation.createFormation(1, config);
  const limits = formation.bounds(group);
  group.offsetX = config.fieldWidth - 24 - limits.max;
  group.direction = 1;
  formation.stepFormation(group, config.fixedStep, config);
  assert.equal(group.direction, -1);
  assert.equal(group.offsetY, group.stepDown);
});

test('el disparo enemigo respeta la cadencia configurada', () => {
  const group = formation.createFormation(1, config);
  formation.stepFormation(group, config.enemyFireInterval + 0.01, config);
  assert.equal(formation.consumeEnemyFire(group, config), true);
  assert.equal(group.fireCooldown, config.enemyFireInterval);
  assert.equal(formation.consumeEnemyFire(group, config), false);
});

test('la posicion mas baja sigue al desplazamiento vertical', () => {
  const group = formation.createFormation(1, config);
  const initial = formation.bounds(group).lowest;
  group.offsetY += 40;
  assert.equal(formation.bounds(group).lowest, initial + 40);
});
