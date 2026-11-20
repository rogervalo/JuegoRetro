(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.sound = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function createSoundEngine(options) {
    options = options || {};
    var ContextCtor = options.contextCtor;
    if (!ContextCtor && typeof globalThis !== 'undefined') {
      ContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
    }
    var context = options.context || null;
    var master = null;
    var noiseBuffer = null;

    function ensureContext() {
      if (!ContextCtor && !context) return null;
      if (!context) context = new ContextCtor();
      if (!master) {
        master = context.createGain();
        master.gain.value = 0.16;
        master.connect(context.destination);
      }
      if (context.state === 'suspended' && context.resume) {
        var resumed = context.resume();
        if (resumed && typeof resumed.catch === 'function') resumed.catch(function () {});
      }
      return context;
    }

    function unlock() {
      ensureContext();
    }

    function envelope(gain, when, peak, duration) {
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(peak, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    }

    function tone(type, fromHz, toHz, duration, peak, delay) {
      var ctx = ensureContext();
      if (!ctx || !master) return;
      var when = ctx.currentTime + (delay || 0);
      var oscillator = ctx.createOscillator();
      var gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(fromHz, when);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, toHz), when + duration
      );
      envelope(gain, when, peak, duration);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(when);
      oscillator.stop(when + duration + 0.02);
    }

    function getNoiseBuffer(ctx) {
      if (noiseBuffer) return noiseBuffer;
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < data.length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      return noiseBuffer;
    }

    function noise(duration, peak, cutoff) {
      var ctx = ensureContext();
      if (!ctx || !master) return;
      var when = ctx.currentTime;
      var source = ctx.createBufferSource();
      var filter = ctx.createBiquadFilter();
      var gain = ctx.createGain();
      source.buffer = getNoiseBuffer(ctx);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, when);
      filter.frequency.exponentialRampToValueAtTime(120, when + duration);
      envelope(gain, when, peak, duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(when);
      source.stop(when + duration);
    }

    function shoot() {
      tone('square', 880, 220, 0.09, 0.5);
    }

    function explode() {
      noise(0.24, 0.7, 1800);
      tone('triangle', 180, 60, 0.2, 0.25);
    }

    function lifeLost() {
      tone('sawtooth', 320, 90, 0.45, 0.45);
      tone('square', 160, 70, 0.35, 0.25, 0.12);
    }

    return {
      unlock: unlock,
      shoot: shoot,
      explode: explode,
      lifeLost: lifeLost
    };
  }

  return { createSoundEngine: createSoundEngine };
});
