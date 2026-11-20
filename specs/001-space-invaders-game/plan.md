# Implementation Plan: Juego Space Invaders Neon

**Branch**: `001-space-invaders-game` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-space-invaders-game/spec.md`

## Summary

Implementar un juego de tipo Space Invaders jugable desde `index.html` sin
servidor ni dependencias: nave controlada con flechas, disparo con Space,
formaciones de enemigos que descienden por oleadas, 3 vidas, puntuación y
récord persistente, pantalla de inicio y reinicio al perder. El enfoque técnico
separa una simulación pura y determinista de la presentación en Canvas 2D, con
bucle de paso fijo y sprites neón pre-renderizados para sostener 60 FPS.

## Technical Context

**Language/Version**: JavaScript ES2020+ (scripts clásicos con envoltorio IIFE y
exportación condicional a Node; ver excepción en *Complexity Tracking*).

**Primary Dependencies**: Ninguna. Solo APIs web estándar (Canvas 2D, eventos
DOM, almacenamiento local) y el ejecutor de pruebas integrado de Node.

**Storage**: Almacenamiento local del navegador bajo
`juegoia.space-invaders.best`, con respaldo en memoria. Ver
[storage-contract.md](./contracts/storage-contract.md).

**Testing**: `node --test` con `node:assert/strict` para reglas puras; prueba
manual de interfaz en Chrome y Firefox para entrada, render y persistencia.

**Target Platform**: Escritorio con Chrome o Firefox estables, ejecutando
`index.html` directamente desde disco (sin servidor ni instalación).

**Project Type**: Juego web estático de una sola página, sin backend.

**Performance Goals**: 60 FPS sostenidos (~16,67 ms por fotograma); simulación
a paso fijo de 1/60 s con un máximo de 5 pasos de recuperación por fotograma.

**Constraints**: Cero dependencias y cero peticiones de red; apertura directa
del archivo; diseño retro neón; módulos por responsabilidad de hasta 300
líneas; sin audio, móvil ni clasificación en línea en esta versión.

**Scale/Scope**: Un campo de juego, un jugador, 3 vidas, formación de 5×10
enemigos, oleadas con velocidad tope y un único récord local.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / restricción | Estado | Evidencia en el diseño |
|-------------------------|--------|------------------------|
| I. Zero-Dependency Browser Stack (NON-NEGOTIABLE) | PASS | Sitio estático, sin librerías, servidor, bundler ni CDN; `index.html` abre directamente |
| II. Frame Budget Discipline (NON-NEGOTIABLE) | PASS | `requestAnimationFrame`, paso fijo, límite de recuperación, sprites pre-renderizados, sin asignaciones por fotograma |
| III. Modular, Organized Code | PASS | `core`, `input`, `entities`, `render`, `state`, `ui`; interfaces explícitas y límite de 300 líneas por archivo |
| IV. Deterministic, Separated Game Logic | PASS | `step(state, input, dt)` puro y pruebas `node --test` sin DOM |
| V. Retro Neon Aesthetic Consistency | PASS | `theme.js` centraliza paleta y efectos; sprites neón en caché |
| VI. Self-Contained Assets & Offline Operation | PASS | Todos los recursos se generan en código; cero peticiones de red |
| VII. Simplicity & Scope Discipline | PASS | Solo los requisitos FR-001 a FR-017; audio, móvil y perfiles quedan fuera |
| Restriction: plain ES modules | EXCEPTION | Ver *Complexity Tracking*: los módulos ES no funcionan desde `file://` |

**Gate result**: PASS. No hay violaciones de principios no negociables. La
única desviación de una restricción técnica está justificada y registrada abajo;
la comprobación posterior al diseño (fase 1) la confirma sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/001-space-invaders-game/
├── plan.md              # Este archivo
├── research.md          # Decisiones de la fase 0
├── data-model.md        # Entidades y transiciones de la fase 1
├── quickstart.md        # Guía de validación de la fase 1
├── contracts/
│   ├── ui-contract.md
│   └── storage-contract.md
└── tasks.md             # Fase 2 (/speckit.tasks), no creado aquí
```

### Source Code (repository root)

```text
index.html
styles/
└── main.css
src/
├── core/
│   ├── config.js
│   ├── loop.js
│   └── game.js
├── input/
│   └── keyboard.js
├── entities/
│   ├── ship.js
│   ├── invader.js
│   ├── bullet.js
│   └── formation.js
├── state/
│   ├── game-state.js
│   └── record.js
├── render/
│   ├── theme.js
│   ├── sprites.js
│   └── renderer.js
└── ui/
    └── screens.js
tests/
└── unit/
    ├── game-state.test.js
    ├── formation.test.js
    ├── collision.test.js
    └── record.test.js
```

**Structure Decision**: Proyecto único y estático. `index.html` carga los
scripts en orden de dependencia (config → entidades → estado → render → ui →
core → arranque). Cada archivo registra su API en `globalThis.JuegoIA` y los
módulos de lógica pura exponen la misma API mediante `module.exports` para que
`node --test` pueda importarlos sin DOM. No se crea `package.json`: las pruebas
se ejecutan con el runner integrado de Node. La carpeta `src/audio` mencionada
en la constitución no se crea porque el audio está fuera del alcance de la
especificación.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Scripts clásicos con IIFE en lugar de módulos ES | Las peticiones de módulos usan CORS y `file://` nunca es mismo origen: Chrome/Firefox bloquean los módulos al abrir `index.html`. El principio I exige jugar sin servidor y el IV exige lógica importable en Node | Módulos ES + servidor estático rompe la apertura directa del archivo; un único script en línea rompe la modularidad y las pruebas aisladas |

Nota de seguimiento (fuera del alcance de este comando): se recomienda una
enmienda PATCH a la constitución para alinear la restricción "plain ECMAScript
modules" con la ejecución desde `file://` y registrar esta excepción.
