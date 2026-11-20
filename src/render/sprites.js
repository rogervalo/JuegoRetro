(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.sprites = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function makeCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height);
    }
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function glowRect(ctx, color, x, y, width, height, glow) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  function createShipSprite(theme) {
    var canvas = makeCanvas(56, 40);
    var ctx = canvas.getContext('2d');
    glowRect(ctx, theme.ship, 18, 10, 20, 18, theme.glow);
    glowRect(ctx, theme.cyan, 8, 24, 40, 8, theme.glow * 0.6);
    glowRect(ctx, theme.lime, 24, 4, 8, 10, theme.glow * 0.7);
    return canvas;
  }

  function createInvaderSprite(theme, kind) {
    var canvas = makeCanvas(52, 40);
    var ctx = canvas.getContext('2d');
    var color = theme.invaders[kind];
    glowRect(ctx, color, 10, 10, 32, 14, theme.glow);
    glowRect(ctx, theme.background, 15, 14, 6, 6, 0);
    glowRect(ctx, theme.background, 31, 14, 6, 6, 0);
    if (kind === 0) {
      glowRect(ctx, color, 6, 4, 8, 6, theme.glow * 0.6);
      glowRect(ctx, color, 38, 4, 8, 6, theme.glow * 0.6);
    } else if (kind === 1) {
      glowRect(ctx, color, 14, 26, 6, 8, theme.glow * 0.6);
      glowRect(ctx, color, 32, 26, 6, 8, theme.glow * 0.6);
    } else {
      glowRect(ctx, color, 22, 26, 8, 8, theme.glow * 0.6);
    }
    return canvas;
  }

  function createBulletSprite(theme, color, height) {
    var canvas = makeCanvas(10, height + 12);
    var ctx = canvas.getContext('2d');
    glowRect(ctx, color, 4, 6, 3, height, theme.glow);
    return canvas;
  }

  function createScanlines(config, theme) {
    var canvas = makeCanvas(config.fieldWidth, config.fieldHeight);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = theme.scanline;
    for (var y = 0; y < config.fieldHeight; y += 4) {
      ctx.fillRect(0, y, config.fieldWidth, 1);
    }
    return canvas;
  }

  function createSpriteCache(config, theme) {
    return {
      ship: createShipSprite(theme),
      invaders: [
        createInvaderSprite(theme, 0),
        createInvaderSprite(theme, 1),
        createInvaderSprite(theme, 2)
      ],
      bullets: {
        player: createBulletSprite(theme, theme.bulletPlayer, 14),
        enemy: createBulletSprite(theme, theme.bulletEnemy, 12)
      },
      scanlines: createScanlines(config, theme)
    };
  }

  return { createSpriteCache: createSpriteCache };
});
