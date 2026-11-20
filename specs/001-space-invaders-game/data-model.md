# Data Model: Juego Space Invaders Neon

**Feature**: `specs/001-space-invaders-game/spec.md`

## Visión general

El estado de una partida es un valor plano y serializable. La lógica pura recibe
ese estado, una instantánea de entrada y un paso de tiempo fijo, y devuelve un
estado nuevo o muta una copia controlada. Ninguna entidad conoce el lienzo ni el
DOM.

## Configuración (`GameConfig`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fieldWidth`, `fieldHeight` | entero | Dimensiones lógicas del campo de juego |
| `fixedStep` | número | Duración del paso de simulación, 1/60 s |
| `shipSpeed` | número | Desplazamiento horizontal por segundo |
| `bulletSpeed` | número | Velocidad vertical de los proyectiles |
| `enemyFireInterval` | número | Intervalo medio entre disparos enemigos |
| `invulnerabilityTime` | número | 1,5 s de protección tras un impacto |
| `waveSpeedBase`, `waveSpeedGrowth`, `waveSpeedMax` | número | Velocidad base, crecimiento por oleada y techo |
| `formationRows`, `formationCols` | entero | 5 × 10 enemigos |
| `initialLives` | entero | 3 |
| `maxRecord` | entero | 999999 |

## Entidades

### `GameState`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `phase` | enumeración | `start`, `playing`, `gameover` |
| `score` | entero | Puntos acumulados en la partida actual |
| `best` | entero | Mejor puntuación de la sesión o persistida |
| `lives` | entero | Vidas restantes, de 0 a 3 |
| `wave` | entero | Número de oleada, empieza en 1 |
| `ship` | `Ship` | Estado de la nave |
| `formation` | `Formation` | Formación activa |
| `bullets` | `Bullet[]` | Proyectiles activos |
| `invulnerabilityLeft` | número | Tiempo de protección restante |
| `elapsedTime` | número | Tiempo de simulación transcurrido |

### `Ship`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `x`, `y` | número | Posición central; `y` se mantiene fijo cerca del borde inferior |
| `width`, `height` | entero | Tamaño de la caja de colisión |
| `speed` | número | Velocidad horizontal derivada de `GameConfig` |

### `Invader`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | entero | Identificador estable dentro de la oleada |
| `x`, `y` | número | Posición central |
| `width`, `height` | entero | Tamaño de la caja de colisión |
| `alive` | booleano | Indica si sigue en juego |
| `points` | entero | Puntos que concede al ser eliminado (por fila) |
| `kind` | entero | Variante visual de la fila (0, 1 o 2) |

### `Bullet`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | entero | Identificador único incremental |
| `owner` | enumeración | `player` o `enemy` |
| `x`, `y` | número | Posición central |
| `width`, `height` | entero | Tamaño de la caja de colisión |
| `velocityY` | número | Velocidad vertical con signo |
| `active` | booleano | Indica si continúa en el campo |

### `Formation`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `wave` | entero | Oleada que representa |
| `enemies` | `Invader[]` | Miembros de la formación |
| `offsetX`, `offsetY` | número | Desplazamiento del grupo respecto a su origen |
| `direction` | entero | -1 izquierda, 1 derecha |
| `stepDown` | número | Descenso aplicado al invertir dirección |
| `speed` | número | Velocidad horizontal del grupo |
| `fireCooldown` | número | Tiempo restante para el siguiente disparo enemigo |

### `Record`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `value` | entero | Mejor puntuación válida |
| `storageAvailable` | booleano | Indica si la persistencia está disponible |

### `InputState`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `left`, `right` | booleano | Estado de las flechas |
| `fireRequested` | booleano | Petición de disparo en el paso actual |

## Relaciones

- Un `GameState` contiene exactamente un `Ship`, una `Formation` y una lista de
  `Bullet`.
- Un `Formation` contiene hasta `formationRows × formationCols` objetos
  `Invader`.
- Cada `Bullet` pertenece a un `owner`; como máximo un proyectil con
  `owner = player` está activo a la vez.
- `Record` es independiente de la partida y se actualiza cuando
  `score > best`.

## Reglas de validación

- `lives` está entre 0 y `initialLives`; `score`, `best` y `wave` son enteros no
  negativos; `best` nunca baja de `score` durante una partida.
- `ship.x` se limita al intervalo `[width/2, fieldWidth - width/2]`.
- `formation.speed` está entre `waveSpeedBase` y `waveSpeedMax`.
- Un `Invader` eliminado deja de colisionar y de contarse para terminar la
  oleada.
- Un récord leído se acepta solo si es un entero finito entre 0 y `maxRecord`;
  en caso contrario se normaliza a 0.
- El paso de simulación es siempre `fixedStep`; el tiempo de-frame real solo se
  usa para decidir cuántos pasos ejecutar.

## Transiciones de estado

| Estado actual | Evento | Estado resultante |
|---------------|--------|-------------------|
| `start` | Iniciar partida | `playing`, vidas 3, puntos 0, oleada 1 |
| `playing` | Impacto con vidas restantes | `playing`, vidas -1, oleada reiniciada, invulnerabilidad activa |
| `playing` | Última vida perdida | `gameover`, se actualiza `best` |
| `playing` | Oleada eliminada | `playing`, oleada +1, velocidad incrementada |
| `gameover` | Pulsar reinicio | `playing`, vidas 3, puntos 0, oleada 1, `best` conservado |
| cualquier | Recargar página | `start`, `best` persistido o degradado a memoria |
