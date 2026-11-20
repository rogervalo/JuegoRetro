# Data Model: Power-ups, jefes y tabla de mejores puntajes

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`

## Visión general

El estado de la partida sigue siendo un valor plano y serializable. La lógica
pura recibe estado, entrada y `dt`, y muta una copia controlada. Las entidades
nuevas no conocen el lienzo ni el DOM. La única persistencia es la tabla de
puntajes, separada del estado de la partida.

## Configuración (`GameConfig`)

Campos existentes que se conservan: `fieldWidth`, `fieldHeight`, `fixedStep`,
`shipSpeed`, `bulletSpeed`, `enemyFireInterval`, `invulnerabilityTime`,
`waveSpeedBase`, `waveSpeedGrowth`, `waveSpeedMax`, `formationRows`,
`formationCols`, `initialLives` y `maxRecord`.

| Campo nuevo | Tipo | Valor | Descripción |
|-------------|------|-------|-------------|
| `powerUpDropChance` | número | 0,15 | Probabilidad por enemigo destruido |
| `powerUpFallSpeed` | número | 90 | Descenso en px/s |
| `powerUpSize` | entero | 26 | Lado de la caja de colisión |
| `maxPowerUps` | entero | 8 | Tope de power-ups simultáneos en campo |
| `doubleShotDuration` | número | 10 | Segundos de disparo doble |
| `shieldDuration` | número | 8 | Segundos de escudo |
| `maxLives` | entero | 5 | Tope de vidas |
| `extraLifeBonus` | entero | 250 | Puntos si la vida extra llega al tope |
| `bossEvery` | entero | 3 | Frecuencia de oleadas de jefe |
| `bossBaseHealth` | entero | 40 | Vida del primer jefe |
| `bossHealthGrowth` | entero | 20 | Vida adicional por jefe |
| `bossBasePoints` | entero | 500 | Puntos del primer jefe |
| `bossPointsGrowth` | entero | 250 | Puntos adicionales por jefe |
| `bossSpeed` | número | 80 | Velocidad horizontal inicial |
| `bossSpeedGrowth` | número | 12 | Incremento de velocidad por jefe |
| `bossSpeedMax` | número | 160 | Techo de velocidad |
| `bossFireInterval` | número | 2,0 | Cadencia inicial entre disparos |
| `bossFireIntervalStep` | número | 0,18 | Reducción de cadencia por jefe |
| `bossFireIntervalMin` | número | 0,9 | Cadencia mínima |
| `bossWidth`, `bossHeight` | entero | 180 × 96 | Caja de colisión |
| `bossTop` | número | 120 | Altura fija del centro del jefe |
| `leaderboardSize` | entero | 5 | Entradas conservadas |
| `maxWave` | entero | 9999 | Tope de oleada |
| `randomSeed` | entero | constante | Semilla del LCG de drops |

## Entidades

### `GameState` (campos nuevos o modificados)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `phase` | enumeración | `start`, `playing`, `gameover` |
| `score`, `best` | entero | Puntos actuales y mejor puntuación de la sesión; al iniciar y terminar coincide con la primera entrada de la tabla |
| `lives` | entero | 0 a `maxLives` |
| `wave` | entero | 1 a `maxWave` |
| `ship` | `Ship` | Sin cambios |
| `formation` | `Formation` | Formación normal o vacía en oleada de jefe |
| `boss` | `Boss` o `null` | Presente solo en oleadas múltiplo de `bossEvery` |
| `bullets` | `Bullet[]` | Proyectiles activos |
| `powerUps` | `PowerUp[]` | Power-ups activos en campo (máximo 8) |
| `effects` | `ActiveEffects` | Temporizadores de mejoras |
| `rngState` | entero 32 bits | Estado del generador de drops |
| `invulnerabilityLeft` | número | Protección tras impacto |
| `elapsedTime` | número | Tiempo de simulación |

### `PowerUp`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | entero | Identificador incremental |
| `type` | enumeración | `double`, `shield`, `life` |
| `x`, `y` | número | Posición central |
| `prevX`, `prevY` | número | Posición del paso anterior para interpolar |
| `width`, `height` | entero | Caja de colisión |
| `velocityY` | número | Velocidad de caída positiva |
| `active` | booleano | `false` al recogerse o salir del campo |

### `ActiveEffects`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `doubleShot` | número | Segundos restantes de disparo doble, ≥ 0 |
| `shield` | número | Segundos restantes de escudo, ≥ 0 |

### `Boss`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `wave` | entero | Oleada a la que pertenece |
| `encounter` | entero | Número de jefe (1, 2, 3…) |
| `x`, `y` | número | Posición central; `y` fijo en `bossTop` |
| `prevX` | número | Posición anterior para interpolar |
| `width`, `height` | entero | Caja de colisión |
| `health`, `maxHealth` | entero | Vida actual y máxima |
| `alive` | booleano | `false` al recibir el impacto final |
| `rewarded` | booleano | Evita otorgar la recompensa dos veces |
| `points` | entero | Bonificación al ser derrotado |
| `speed` | número | Velocidad horizontal |
| `direction` | entero | -1 izquierda, 1 derecha |
| `fireInterval` | número | Segundos entre disparos |
| `fireCooldown` | número | Tiempo restante para disparar |

### `Formation` (sin cambios de forma)

En oleadas de jefe se usa una formación vacía: `enemies = []`, `offsetX = 0`,
`offsetY = 0`, `direction = 1`, `speed = 0` y `fireCooldown` inicial. El resto
de campos se conserva para que el render y el estado no necesiten ramas
especiales.

### `LeaderboardEntry`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `score` | entero | Puntuación, mayor que 0 y ≤ `maxRecord` |
| `wave` | entero | Oleada alcanzada, 1 a `maxWave` |
| `date` | cadena | Fecha local `YYYY-MM-DD` |

### `LeaderboardLoadResult`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `entries` | `LeaderboardEntry[]` | Hasta cinco entradas ordenadas |
| `storageAvailable` | booleano | Indica si la persistencia funciona |

### `LeaderboardAddResult`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `entries` | `LeaderboardEntry[]` | Tabla resultante ordenada |
| `highlightIndex` | entero | Posición de la entrada nueva, -1 si no calificó |
| `entry` | `LeaderboardEntry` o `null` | Entrada validada que se intentó añadir |
| `storageAvailable` | booleano | Estado de la persistencia |

## Relaciones

- Un `GameState` contiene una nave, una formación, una lista de proyectiles,
  una lista de power-ups, un objeto de efectos y, opcionalmente, un jefe.
- `state.boss != null` si y solo si `wave % bossEvery === 0`; en ese caso
  `state.formation.enemies` está vacío.
- Cada `PowerUp` recogido modifica `state.effects`, `state.lives` o
  `state.score`, y se marca inactivo.
- Un `Boss` derrotado otorga puntos y genera un `PowerUp`; no pertenece a
  `state.formation.enemies`.
- La tabla es independiente de la partida. `state.best` se inicializa con la
  primera entrada de la tabla (o 0 si está vacía) y se actualiza si la partida
  supera ese valor; al terminar, la tabla incluye la puntuación final.

## Reglas de validación

- `score` y `best` son enteros entre 0 y `maxRecord`; `best` no disminuye
  durante la sesión.
- `lives` es un entero entre 0 y `maxLives`; empieza en `initialLives` y la vida
  extra no supera `maxLives`.
- `wave` es un entero entre 1 y `maxWave`.
- `effects.doubleShot` y `effects.shield` son números ≥ 0 y no superan su
  duración configurada tras una recogida.
- `boss.health` está entre 0 y `maxHealth`; `boss.alive` es `false` cuando la
  vida llega a 0.
- `powerUps` contiene como máximo `maxPowerUps` elementos activos.
- Un `PowerUp` inactivo deja de colisionar y se elimina al compactar.
- Una entrada de tabla se acepta solo si `score` es un entero > 0 y
  ≤ `maxRecord`, `wave` es un entero válido y `date` cumple `YYYY-MM-DD`.
- Las entradas inválidas o corruptas se descartan; la tabla se recorta a
  `leaderboardSize` después de ordenar.
- Si `localStorage` falla al leer o escribir, se usa la copia en memoria y el
  juego continúa.

## Transiciones de estado

| Estado actual | Evento | Estado resultante |
|---------------|--------|-------------------|
| `start` | Iniciar partida | `playing`; vidas 3, puntos 0, oleada 1, efectos 0, power-ups vacíos, sin jefe |
| `playing` | Enemigo destruido | Puede aparecer un `PowerUp`; se actualizan puntos y `best` |
| `playing` | Power-up de disparo/escudo recogido | Se fija o renueva el temporizador correspondiente |
| `playing` | Vida extra recogida | `lives + 1` hasta `maxLives`; si está al tope, `score + extraLifeBonus` |
| `playing` | Impacto con escudo activo | Sin cambios de vida ni invulnerabilidad |
| `playing` | Impacto con vidas restantes y sin escudo | `lives - 1`, invulnerabilidad; se limpian proyectiles; la formación normal se reinicia y el jefe conserva su vida |
| `playing` | Última vida perdida | `gameover`; se actualiza `best`; la tabla recibe la entrada |
| `playing` | Formación normal eliminada | `wave + 1`; si es múltiplo de 3, aparece un jefe; si no, formación normal |
| `playing` | Jefe con vida 0 | `boss.alive = false`; si la partida sigue, se suman puntos y cae un power-up; después `wave + 1` |
| `playing` | Jefe derrotado y última vida perdida en el mismo paso | `gameover`; no se otorga recompensa del jefe |
| `gameover` | Reiniciar | `playing`; estado inicial, `best` y tabla conservados |
| Cualquiera | Recargar página | `start`; tabla cargada o degradada a memoria |

## Fórmulas de escalado

- Jefe `n` (donde `n = wave / bossEvery`): vida =
  `bossBaseHealth + bossHealthGrowth * (n - 1)`; puntos =
  `bossBasePoints + bossPointsGrowth * (n - 1)`; velocidad =
  `min(bossSpeedMax, bossSpeed + bossSpeedGrowth * (n - 1))`; cadencia =
  `max(bossFireIntervalMin, bossFireInterval - bossFireIntervalStep * (n - 1))`.
- Drop: una tirada uniforme por enemigo; si `roll < powerUpDropChance`, el tipo
  se elige con otra tirada uniforme entre los tres tipos.
