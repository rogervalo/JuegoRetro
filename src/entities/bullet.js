(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.JuegoIA = root.JuegoIA || {};
    root.JuegoIA.bullet = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var nextId = 1;

  function createBullet(owner, x, y, config) {
    var player = owner === 'player';
    return {
      id: nextId++,
      owner: owner,
      x: x,
      y: y,
      width: 4,
      height: player ? 14 : 12,
      velocityY: player ? -config.bulletSpeed : config.bulletSpeed * 0.55,
      active: true
    };
  }

  function advanceBullet(bullet, dt, config) {
    bullet.y += bullet.velocityY * dt;
    if (bullet.y < -20 || bullet.y > config.fieldHeight + 20) {
      bullet.active = false;
    }
    return bullet;
  }

  function countActivePlayerBullets(bullets) {
    var count = 0;
    for (var i = 0; i < bullets.length; i += 1) {
      if (bullets[i].active && bullets[i].owner === 'player') count += 1;
    }
    return count;
  }

  function hasActivePlayerBullet(bullets) {
    return countActivePlayerBullets(bullets) > 0;
  }

  return {
    createBullet: createBullet,
    advanceBullet: advanceBullet,
    countActivePlayerBullets: countActivePlayerBullets,
    hasActivePlayerBullet: hasActivePlayerBullet
  };
});
