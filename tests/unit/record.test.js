'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { config } = require('../../src/core/config.js');
const record = require('../../src/state/record.js');

function fakeStorage(initialValue) {
  const data = Object.create(null);
  if (initialValue !== undefined) data[record.KEY] = String(initialValue);
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

test('cargar sin clave devuelve cero y almacenamiento disponible', () => {
  const loaded = record.createRecordStore(fakeStorage(), config).load();
  assert.deepEqual(loaded, { value: 0, storageAvailable: true });
});

test('cargar un valor valido devuelve el record guardado', () => {
  const loaded = record.createRecordStore(fakeStorage(450), config).load();
  assert.equal(loaded.value, 450);
  assert.equal(loaded.storageAvailable, true);
});

test('los valores corruptos o fuera de rango se normalizan a cero', () => {
  for (const raw of ['abc', '12.5', '-4', String(config.maxRecord + 1)]) {
    const loaded = record.createRecordStore(fakeStorage(raw), config).load();
    assert.equal(loaded.value, 0, raw);
  }
});

test('un almacenamiento que falla degrada a memoria de la sesion', () => {
  const broken = {
    getItem() {
      throw new Error('bloqueado');
    },
    setItem() {
      throw new Error('bloqueado');
    }
  };
  const store = record.createRecordStore(broken, config);
  const loaded = store.load();
  assert.equal(loaded.value, 0);
  assert.equal(loaded.storageAvailable, false);
  store.save(80);
  assert.equal(store.load().value, 80);
});

test('guardar nunca reduce el record y respeta el maximo', () => {
  const store = record.createRecordStore(fakeStorage(100), config);
  store.load();
  store.save(50);
  assert.equal(store.load().value, 100);
  store.save(config.maxRecord + 5);
  assert.equal(store.load().value, 100);
});
