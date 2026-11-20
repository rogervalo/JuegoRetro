# Gameplay Contract: Power-ups, jefe y tabla

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`

## Principios

- La simulación es pura y determinista: `step(state, input, dt, config)` no toca
  Canvas, DOM, almacenamiento ni relojes.
- El paso fijo es `config.fixedStep`; el borde (bucle o bootstrap) inyecta la
  fecha de la tabla.
- Ninguna lista crece sin límite: máximo 8 power-ups activos, un jefe y cinco
  entradas de tabla.

## Interfaces de módulos

### `src/core/geometry.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `overlaps(a, b)` | Dos cajas `{x, y, width, height}` | Booleano | Intersección AABB estricta, igual que la lógica existente |

### `src/entities/powerup.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `createPowerUp(type, x, y, config)` | Tipo `double`/`shield`/`life`, posición, configuración | `PowerUp` | Caja de `powerUpSize`, velocidad `powerUpFallSpeed`, `active = true` |
| `advancePowerUp(powerUp, dt, config)` | Power-up y paso | `PowerUp` | Desciende; se desactiva al cruzar el borde inferior |

### `src/core/powerups.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `nextRandom(state)` | Estado | Número en `[0, 1)` | LCG de 32 bits; actualiza `state.rngState` |
| `maybeDrop(state, x, y, config, roll?)` | Estado, posición, configuración, tirada opcional | `PowerUp` o `null` | Si `roll < powerUpDropChance` y hay espacio, crea un tipo uniforme; sin `roll` usa `nextRandom` |
| `dropPowerUp(state, x, y, config, type)` | Estado, posición, configuración, tipo | `PowerUp` | Fuerza la creación (usado por el jefe) |
| `advancePowerUps(state, dt, config)` | Estado, paso | Número de recogidos | Avanza, recoge al solaparse con la nave y compacta inactivos |
| `updateEffects(state, dt)` | Estado, paso | — | Resta `dt` a ambos temporizadores y satura en 0 |
| `isShieldActive(state)` | Estado | Booleano | `state.effects.shield > 0` |
| `isDoubleShotActive(state)` | Estado | Booleano | `state.effects.doubleShot > 0` |

Reglas de recogida:

- `double`: `effects.doubleShot = doubleShotDuration`.
- `shield`: `effects.shield = shieldDuration`.
- `life`: `lives + 1` hasta `maxLives`; si ya está en el tope,
  `score += extraLifeBonus` y se actualiza `best` si corresponde.
- Recoger el mismo tipo renueva la duración completa; no acumula.
- El power-up recogido se marca `active = false`.

### `src/entities/boss.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `isBossWave(wave, config)` | Oleada, configuración | Booleano | `wave % bossEvery === 0` |
| `createBoss(wave, config)` | Oleada, configuración | `Boss` | Aplica las fórmulas de escalado; `y = bossTop`; `alive = true`; `rewarded = false` |
| `stepBoss(boss, dt, config)` | Jefe, paso, configuración | `Boss` | Movimiento horizontal con rebote en márgenes; `y` no cambia; reduce `fireCooldown` |
| `consumeBossFire(boss, config)` | Jefe, configuración | Booleano | Si `fireCooldown <= 0`, lo reinicia a `fireInterval` y devuelve `true` |

### `src/core/combat.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `resolvePlayerShots(state, config)` | Estado, configuración | — | Cada proyectil del jugador impacta como máximo un objetivo; los enemigos muertos pueden soltar power-up; el jefe pierde 1 de vida y se marca `alive = false` a 0, sin recompensa todavía |
| `finalizeBossDefeat(state, config)` | Estado, configuración | Booleano | Si el jefe no está vivo, no fue recompensado y `phase === 'playing'`, suma `boss.points`, actualiza `best`, marca `rewarded` y suelta un power-up |

### `src/entities/bullet.js`

| Función | Entrada | Salida | Regla |
|---------|---------|--------|-------|
| `countActivePlayerBullets(bullets)` | Lista | Entero | Cuenta proyectiles `owner === 'player'` y `active` |

### `src/core/game.js` (interfaz pública)

| Función | Entrada | Salida | Cambio |
|---------|---------|--------|--------|
| `start(state, config, best)` | Estado, configuración, mejor puntuación | Estado | Reinicia partida y oleada 1 |
| `restart(state, config)` | Estado, configuración | Estado | Reinicia conservando `state.best` |
| `fire(state, config)` | Estado, configuración | `Bullet[]` | Devuelve 0, 1 o 2 proyectiles; aplica el límite de salva |
| `updateBest(state)` | Estado | Entero | Sin cambios |
| `loseLife(state, config)` | Estado, configuración | Booleano | Bloquea si hay invulnerabilidad o escudo; reinicia formación normal o conserva la vida del jefe |
| `step(state, input, dt, config)` | Estado, entrada, paso, configuración | Estado | Orquesta el paso descrito abajo |

### `src/state/leaderboard.js`

| Función | Entrada | Salida |
|---------|---------|--------|
| `normalizeEntry(raw, config)` | Valor desconocido | `LeaderboardEntry` o `null` |
| `normalizeEntries(raw, config)` | Valor desconocido | Lista válida, ordenada y recortada |
| `compare(a, b)` | Dos entradas | Entero de orden |
| `today(date?)` | Fecha opcional | `YYYY-MM-DD` local |
| `createLeaderboardStore(storage, config)` | Almacenamiento o `null`, configuración | `{ load, add }` |

Ver [storage-contract.md](./storage-contract.md) para el formato y las
garantías.

### `src/ui/screens.js`

| Función | Entrada | Efecto |
|---------|---------|--------|
| `showStart(entries)` | Entradas de tabla | Muestra inicio y tabla, oculta fin |
| `showGameOver(state, addResult)` | Estado final y resultado de `add` | Muestra puntuación, tabla y fila destacada |
| `hideAll()` | — | Oculta ambas pantallas |
| `bindActions(onStart, onRestart)` | Callbacks | Conecta botones |

### `src/core/loop.js`

Opciones nuevas: `leaderboard` (store) en lugar de `store`. Al terminar la
partida se llama una sola vez a `leaderboard.add(state.score, state.wave,
leaderboard.today())`; `best` pasa a ser la primera entrada. El bucle marca
`prevX`/`prevY` de power-ups y `prevX` del jefe antes de cada paso.

## Orden del paso de simulación

1. Si `phase !== 'playing'`, no hacer nada.
2. `elapsedTime += dt`.
3. `powerups.updateEffects(state, dt)`.
4. Reducir `invulnerabilityLeft`.
5. Mover la nave.
6. Si hay jefe: `boss.stepBoss`; si no: `formation.stepFormation`.
7. Si `input.fireRequested`: `fire` y limpiar la petición.
8. Avanzar proyectiles.
9. Avanzar y recoger power-ups.
10. `combat.resolvePlayerShots` (enemigos y jefe).
11. `combat.finalizeBossDefeat` solo si `phase === 'playing'`.
12. Generar disparo enemigo: jefe si existe y está vivo; si no, formación.
13. Comprobar daño al jugador (proyectiles, formación y contacto con el jefe).
14. Si sigue `playing`, comprobar progreso de oleada.
15. Compactar proyectiles y power-ups.

## Reglas de juego

- El disparo doble permite hasta dos proyectiles activos; sin la mejora, uno.
- El escudo evita la pérdida de vida mientras `shield > 0`; no se consume por
  impacto y no activa invulnerabilidad.
- El jefe no desciende ni provoca pérdida de vida por el borde inferior.
- Derrotar al jefe otorga puntos, suelta un power-up y avanza a la siguiente
  oleada.
- Si el jugador pierde la última vida en el mismo paso en que el jefe llega a 0,
  prevalece `gameover` y no hay recompensa.
- Al perder una vida: se limpian proyectiles; la formación normal se reinicia;
  el jefe conserva su vida; los power-ups en campo y los efectos activos se
  conservan.
- En oleada de jefe, `state.formation` es vacía y `state.boss` no es `null`.

## Invariantes verificables

- `state.powerUps.length <= maxPowerUps`.
- `state.boss === null` o `state.boss.wave === state.wave`.
- `state.effects.doubleShot >= 0` y `state.effects.shield >= 0`.
- `state.lives <= maxLives`.
- `state.wave <= maxWave`.
- La tabla tiene como máximo `leaderboardSize` entradas, todas válidas y
  ordenadas.
- `fire` nunca crea más proyectiles que el límite de salva vigente.

## Criterios de aceptación

1. Un enemigo destruido con tirada forzada a 0,1 genera un power-up; con 0,9 no.
2. Recoger disparo doble produce dos proyectiles y el temporizador baja con
   `dt`.
3. Con escudo activo, `loseLife` devuelve `false` y no cambia vidas.
4. La vida extra en el tope suma `extraLifeBonus` sin superar `maxLives`.
5. La oleada 3 crea jefe y formación vacía; la 4 vuelve a formación normal.
6. Cada impacto del jugador reduce la vida del jefe; a 0 se marca no vivo.
7. Derrotar al jefe en una partida activa suma puntos, suelta un power-up y
   avanza de oleada.
8. Si el último impacto del jefe coincide con la última vida, no hay recompensa.
9. La tabla ordena, recorta a cinco y conserva la entrada nueva destacada.
