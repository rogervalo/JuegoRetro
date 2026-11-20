# Implementation Plan: Power-ups, jefes y tabla de mejores puntajes

**Branch**: `002-powerups-boss-leaderboard` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-powerups-boss-leaderboard/spec.md`

## Summary

Ampliar el juego con tres sistemas integrados en el bucle existente: power-ups
que caen al destruir enemigos (disparo doble, escudo temporal y vida extra), un
jefe cada tres oleadas con barra de vida y recompensa, y una tabla persistente
con los cinco mejores puntajes que sustituye al récord único. La simulación
sigue siendo pura y determinista mediante un generador pseudoaleatorio con
semilla en el estado; la presentación añade sprites neón en caché, indicadores
de efectos y una tabla DOM accesible. Para respetar el límite de 300 líneas por
archivo, la lógica de power-ups, jefe y resolución de impactos se separa en
módulos pequeños y `game.js` queda como orquestador.

## Technical Context

**Language/Version**: JavaScript ES2020+ en scripts clásicos con envoltorio IIFE
y exportación condicional a Node; Node 18+ para pruebas. Se mantiene la
excepción documentada de `file://` (ver *Complexity Tracking*).

**Primary Dependencies**: Ninguna. Solo Canvas 2D, DOM, `localStorage` y el
runner de pruebas integrado de Node.

**Storage**: `localStorage` con la clave
`juegoia.space-invaders.leaderboard`, valor JSON con hasta cinco entradas
`{ score, wave, date }`; respaldo en memoria si el almacenamiento falla. Ver
[storage-contract.md](./contracts/storage-contract.md). La clave antigua
`juegoia.space-invaders.best` deja de leerse y no se migra.

**Testing**: `node --test tests/unit/*.test.js` con `node:assert/strict` para
reglas puras, más validación manual en Chrome y Firefox. Se añaden pruebas de
power-ups, jefe y tabla; se actualizan las de colisiones, estado y récord.

**Target Platform**: Escritorio con Chrome o Firefox estables, abriendo
`index.html` directamente desde disco, sin servidor ni instalación.

**Project Type**: Juego web estático de una sola página, sin backend.

**Performance Goals**: 60 FPS sostenidos (~16,67 ms por fotograma), paso fijo de
1/60 s y máximo de 5 pasos de recuperación. Power-ups limitados a 8 activos, un
solo jefe y sprites pre-renderizados; sin crecimiento ilimitado de entidades.

**Constraints**: Cero dependencias, cero peticiones de red, apertura directa,
estética neón, archivos de hasta 300 líneas, lógica determinista sin DOM y sin
audio nuevo. El jefe y los power-ups deben funcionar sin cambios en el sistema
de entrada.

**Scale/Scope**: Un jugador, una partida activa, oleadas sin límite práctico
(tope de oleada 9999), un jefe cada 3 oleadas, hasta 8 power-ups en campo y
cinco entradas de tabla.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / restricción | Estado | Evidencia en el diseño |
|-------------------------|--------|------------------------|
| I. Zero-Dependency Browser Stack (NON-NEGOTIABLE) | PASS | Sin librerías, CDN, servidor ni bundler; scripts clásicos y `index.html` directo |
| II. Frame Budget Discipline (NON-NEGOTIABLE) | PASS | `requestAnimationFrame`, paso fijo, sprites en caché, power-ups acotados, un jefe y tablas fuera del bucle |
| III. Modular, Organized Code | PASS | Nuevos módulos `powerups`, `combat`, `powerup`, `boss`, `leaderboard`; `game.js` solo orquesta y ningún archivo supera 300 líneas |
| IV. Deterministic, Separated Game Logic | PASS | RNG con semilla en `state.rngState`, `step` puro y pruebas Node sin DOM; la fecha de la tabla se inyecta desde el borde |
| V. Retro Neon Aesthetic Consistency | PASS | Colores, sprites, aura de escudo y barra de vida se añaden a `theme.js` y a la caché de sprites |
| VI. Self-Contained Assets & Offline Operation | PASS | Iconos y jefe se dibujan proceduralmente; solo se usa almacenamiento local |
| VII. Simplicity & Scope Discipline | PASS | Se implementan únicamente FR-001 a FR-024; no se añade audio, móvil ni clasificación en línea |
| Restricción: módulos ES | EXCEPTION | Se mantiene la excepción registrada en 001: los módulos ES no cargan desde `file://` |

**Gate result**: PASS antes y después del diseño. No hay violaciones nuevas; la
única desviación es la ya justificada sobre el formato de módulos.

## Project Structure

### Documentation (this feature)

```text
specs/002-powerups-boss-leaderboard/
├── plan.md              # Este archivo
├── research.md          # Decisiones de la fase 0
├── data-model.md        # Entidades y transiciones de la fase 1
├── quickstart.md        # Guía de validación de la fase 1
├── contracts/
│   ├── gameplay-contract.md
│   ├── storage-contract.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks), no creado aquí
```

### Source Code (repository root)

```text
index.html
styles/
└── main.css
src/
├── core/
│   ├── config.js          # Nuevas constantes de power-ups, jefe y tabla
│   ├── geometry.js        # Colisión AABB compartida (nuevo)
│   ├── powerups.js        # RNG, drops, recogida y temporizadores (nuevo)
│   ├── combat.js          # Impactos jugador→enemigo/jefe y fin del jefe (nuevo)
│   ├── game.js            # Orquestación de pasos y oleadas (refactor)
│   └── loop.js            # Interpolación, audio y alta en la tabla
├── entities/
│   ├── ship.js
│   ├── invader.js
│   ├── bullet.js          # Conteo de proyectiles activos para disparo doble
│   ├── formation.js       # Formación vacía para oleadas de jefe
│   ├── powerup.js         # Entidad que cae (nuevo)
│   └── boss.js            # Entidad, movimiento y cadencia del jefe (nuevo)
├── state/
│   ├── game-state.js      # Efectos, power-ups, jefe y semilla RNG
│   └── leaderboard.js     # Tabla de 5 puntajes (sustituye a record.js)
├── input/
│   └── keyboard.js
├── render/
│   ├── theme.js
│   ├── sprites.js         # Iconos de power-up y sprite del jefe
│   └── renderer.js        # Entidades, barra de vida, efectos y aura
├── ui/
│   └── screens.js         # Tabla en inicio/fin y fila destacada
└── audio/
    └── sound.js           # Sin cambios
tests/
└── unit/
    ├── game-state.test.js
    ├── formation.test.js
    ├── collision.test.js
    ├── powerups.test.js   # Nuevo
    ├── boss.test.js       # Nuevo
    ├── leaderboard.test.js # Sustituye a record.test.js
    └── sound.test.js
```

**Structure Decision**: Proyecto único y estático. Se conserva el patrón de
scripts clásicos con APIs en `globalThis.JuegoIA` y `module.exports` para Node.
`index.html` carga primero `config` y `geometry`, luego entidades, estado,
render, UI y por último `powerups`, `combat`, `game`, `sound` y `loop`. La lógica
de power-ups y jefe se separa de `game.js` para respetar el límite de 300
líneas. `record.js` y `record.test.js` se retiran: la tabla de cinco posiciones
es la única persistencia de puntuaciones. La interfaz de la tabla se construye
con nodos DOM y `textContent`, nunca con HTML interpolado.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Scripts clásicos con IIFE en lugar de módulos ES | Los módulos ES usan CORS y `file://` no es mismo origen; el principio I exige abrir `index.html` sin servidor y el IV exige lógica importable en Node | Módulos ES + servidor rompen la apertura directa; un único script rompe la modularidad y las pruebas aisladas |

No se añaden otras violaciones. El refactor de `game.js` no cambia su interfaz
pública (`start`, `restart`, `fire`, `updateBest`, `loseLife`, `step`) salvo que
`fire` devuelve la lista de proyectiles creados (0, 1 o 2).
