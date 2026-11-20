(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.renderer = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function lerp(from, to, alpha) {
    return from + (to - from) * alpha;
  }

  function previous(value, key, currentKey) {
    return typeof value[key] === 'number' ? value[key] : value[currentKey];
  }

  function pad(value, size) {
    var text = String(value);
    while (text.length < size) text = '0' + text;
    return text;
  }

  function createRenderer(canvas, config, theme, sprites) {
    var ctx = canvas.getContext('2d');
    canvas.width = config.fieldWidth;
    canvas.height = config.fieldHeight;

    function drawBackground() {
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, config.fieldWidth, config.fieldHeight);
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = 60; x < config.fieldWidth; x += 60) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, config.fieldHeight);
      }
      for (var y = 60; y < config.fieldHeight; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(config.fieldWidth, y);
      }
      ctx.stroke();
    }

    function drawSprite(sprite, x, y) {
      ctx.drawImage(
        sprite,
        Math.round(x - sprite.width / 2),
        Math.round(y - sprite.height / 2)
      );
    }

    function drawEntities(state, alpha) {
      var enemies = state.formation.enemies;
      var offsetX = lerp(
        previous(state.formation, 'prevOffsetX', 'offsetX'),
        state.formation.offsetX,
        alpha
      );
      var offsetY = lerp(
        previous(state.formation, 'prevOffsetY', 'offsetY'),
        state.formation.offsetY,
        alpha
      );

      for (var i = 0; i < enemies.length; i += 1) {
        var enemy = enemies[i];
        if (enemy.alive) {
          drawSprite(sprites.invaders[enemy.kind], enemy.x + offsetX, enemy.y + offsetY);
        }
      }

      for (var j = 0; j < state.bullets.length; j += 1) {
        var bullet = state.bullets[j];
        var sprite = bullet.owner === 'player' ? sprites.bullets.player : sprites.bullets.enemy;
        var bx = lerp(previous(bullet, 'prevX', 'x'), bullet.x, alpha);
        var by = lerp(previous(bullet, 'prevY', 'y'), bullet.y, alpha);
        drawSprite(sprite, bx, by);
      }

      var blinking = state.invulnerabilityLeft > 0 &&
        Math.floor(state.invulnerabilityLeft * 12) % 2 === 0;
      if (!blinking) {
        var shipX = lerp(previous(state.ship, 'prevX', 'x'), state.ship.x, alpha);
        drawSprite(sprites.ship, shipX, state.ship.y);
      }
    }

    function drawHud(state) {
      ctx.save();
      ctx.font = theme.font;
      ctx.textBaseline = 'top';
      ctx.shadowBlur = 8;
      ctx.shadowColor = theme.cyan;
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'left';
      ctx.fillText('PUNTOS ' + pad(state.score, 6), 20, 14);
      ctx.fillText('VIDAS ' + state.lives, 20, 38);
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.magenta;
      ctx.fillText('OLEADA ' + state.wave, config.fieldWidth / 2, 14);
      ctx.textAlign = 'right';
      ctx.fillStyle = theme.lime;
      ctx.shadowColor = theme.lime;
      ctx.fillText('RECORD ' + pad(state.best, 6), config.fieldWidth - 20, 14);
      ctx.restore();
    }

    function render(state, alpha) {
      drawBackground();
      if (state.phase !== 'start') {
        drawEntities(state, alpha);
        drawHud(state);
      }
      ctx.globalAlpha = 0.5;
      ctx.drawImage(sprites.scanlines, 0, 0);
      ctx.globalAlpha = 1;
    }

    return { render: render, ctx: ctx };
  }

  return { createRenderer: createRenderer };
});
