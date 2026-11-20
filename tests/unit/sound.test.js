'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sound = require('../../src/audio/sound.js');

class FakeParam {
  constructor() {
    this.value = 0;
    this.events = [];
  }
  setValueAtTime(value, time) {
    this.events.push(['set', value, time]);
  }
  exponentialRampToValueAtTime(value, time) {
    this.events.push(['ramp', value, time]);
  }
}

class FakeNode {
  connect() {
    return this;
  }
}

class FakeOscillator extends FakeNode {
  constructor() {
    super();
    this.type = '';
    this.frequency = new FakeParam();
    this.startedAt = null;
    this.stoppedAt = null;
  }
  start(time) {
    this.startedAt = time;
  }
  stop(time) {
    this.stoppedAt = time;
  }
}

class FakeGain extends FakeNode {
  constructor() {
    super();
    this.gain = new FakeParam();
  }
}

class FakeFilter extends FakeNode {
  constructor() {
    super();
    this.type = '';
    this.frequency = new FakeParam();
  }
}

class FakeBufferSource extends FakeNode {
  constructor() {
    super();
    this.buffer = null;
    this.startedAt = null;
    this.stoppedAt = null;
  }
  start(time) {
    this.startedAt = time;
  }
  stop(time) {
    this.stoppedAt = time;
  }
}

class FakeBuffer {
  constructor(channels, length, sampleRate) {
    this.sampleRate = sampleRate;
    this.channels = [];
    for (let i = 0; i < channels; i += 1) {
      this.channels.push(new Float32Array(length));
    }
  }
  getChannelData(index) {
    return this.channels[index];
  }
}

class FakeContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.destination = new FakeNode();
    this.oscillators = [];
    this.gains = [];
    this.filters = [];
    this.sources = [];
    this.buffers = [];
    this.resumes = 0;
  }
  createOscillator() {
    const node = new FakeOscillator();
    this.oscillators.push(node);
    return node;
  }
  createGain() {
    const node = new FakeGain();
    this.gains.push(node);
    return node;
  }
  createBiquadFilter() {
    const node = new FakeFilter();
    this.filters.push(node);
    return node;
  }
  createBufferSource() {
    const node = new FakeBufferSource();
    this.sources.push(node);
    return node;
  }
  createBuffer(channels, length, sampleRate) {
    const buffer = new FakeBuffer(channels, length, sampleRate);
    this.buffers.push(buffer);
    return buffer;
  }
  resume() {
    this.resumes += 1;
    this.state = 'running';
    return Promise.resolve();
  }
}

test('sin Web Audio disponible las funciones no fallan', () => {
  const engine = sound.createSoundEngine({ contextCtor: null, context: null });
  assert.doesNotThrow(() => engine.unlock());
  assert.doesNotThrow(() => engine.shoot());
  assert.doesNotThrow(() => engine.explode());
  assert.doesNotThrow(() => engine.lifeLost());
});

test('unlock reanuda el contexto suspendido', () => {
  const context = new FakeContext();
  const engine = sound.createSoundEngine({ context });
  engine.unlock();
  assert.equal(context.resumes, 1);
  assert.equal(context.state, 'running');
});

test('el disparo crea un oscilador con envolvente y parada', () => {
  const context = new FakeContext();
  const engine = sound.createSoundEngine({ context });
  engine.shoot();
  assert.equal(context.oscillators.length, 1);
  const oscillator = context.oscillators[0];
  assert.equal(oscillator.type, 'square');
  assert.equal(oscillator.frequency.events[0][0], 'set');
  assert.equal(oscillator.frequency.events[1][0], 'ramp');
  assert.ok(oscillator.startedAt !== null);
  assert.ok(oscillator.stoppedAt > oscillator.startedAt);
  assert.ok(context.gains.length >= 2);
});

test('la explosion usa ruido filtrado y reutiliza el buffer', () => {
  const context = new FakeContext();
  const engine = sound.createSoundEngine({ context });
  engine.explode();
  engine.explode();
  assert.equal(context.sources.length, 2);
  assert.equal(context.filters.length, 2);
  assert.equal(context.buffers.length, 1);
  assert.equal(context.sources[0].buffer, context.sources[1].buffer);
  assert.equal(context.sources[0].buffer.sampleRate, context.sampleRate);
});

test('perder una vida reproduce dos tonos descendentes', () => {
  const context = new FakeContext();
  const engine = sound.createSoundEngine({ context });
  engine.lifeLost();
  assert.equal(context.oscillators.length, 2);
  assert.equal(context.oscillators[0].type, 'sawtooth');
  assert.equal(context.oscillators[1].type, 'square');
  assert.ok(context.oscillators[1].startedAt > context.oscillators[0].startedAt);
});
