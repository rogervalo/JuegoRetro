---
description: "Task list for Juego Space Invaders Neon"
---

# Tasks: Juego Space Invaders Neon

**Input**: Design documents from `/specs/001-space-invaders-game/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Las tareas de prueba se incluyen porque la constitución (principio
IV) y el plan exigen reglas deterministas verificables sin DOM.

**Organization**: Las tareas se agrupan por historia de usuario para permitir
implementación, prueba y entrega independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Todas las tareas incluyen una ruta de archivo exacta

## Path Conventions

- Proyecto único y estático: `src/` y `tests/` en la raíz del repositorio
- `index.html` se abre directamente desde disco; sin servidor ni constructores
- Las citas `data-model.md: Entity.field` son la fuente canónica de restricciones

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura inicial y esqueleto estático del proyecto

- [X] T001 Crear la estructura de directorios del plan en `index.html`, `styles/`, `src/core/`, `src/input/`, `src/entities/`, `src/state/`, `src/render/`, `src/ui/` y `tests/unit/`
- [X] T002 [P] Crear el esqueleto de `index.html` con el lienzo, contenedores de HUD y las etiquetas `<script>` ordenadas de `src/` según `plan.md`
- [X] T003 [P] Crear estilos base y tokens neón en `styles/main.css` según la decisión R7 de `research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuración, entidades base, estado inicial, entrada y bucle: nada de las historias puede empezar antes de esta fase

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Definir constantes en `src/core/config.js` (data-model.md: `GameConfig.fieldWidth`, `GameConfig.fieldHeight`, `GameConfig.fixedStep`, `GameConfig.shipSpeed`, `GameConfig.bulletSpeed`, `GameConfig.enemyFireInterval`, `GameConfig.invulnerabilityTime`, `GameConfig.waveSpeedBase`, `GameConfig.waveSpeedGrowth`, `GameConfig.waveSpeedMax`, `GameConfig.formationRows`, `GameConfig.formationCols`, `GameConfig.initialLives`, `GameConfig.maxRecord`)
- [X] T005 [P] Crear la fábrica de nave en `src/entities/ship.js` (data-model.md: `Ship.x`, `Ship.y`, `Ship.width`, `Ship.height`, `Ship.speed`)
- [X] T006 [P] Crear la fábrica de invasores en `src/entities/invader.js` (data-model.md: `Invader.id`, `Invader.x`, `Invader.y`, `Invader.width`, `Invader.height`, `Invader.alive`, `Invader.points`, `Invader.kind`)
- [X] T007 [P] Crear la fábrica de proyectiles en `src/entities/bullet.js` (data-model.md: `Bullet.id`, `Bullet.owner`, `Bullet.x`, `Bullet.y`, `Bullet.width`, `Bullet.height`, `Bullet.velocityY`, `Bullet.active`)
- [X] T008 Crear la fábrica de formación en `src/entities/formation.js` (data-model.md: `Formation.wave`, `Formation.enemies`, `Formation.offsetX`, `Formation.offsetY`, `Formation.direction`, `Formation.stepDown`, `Formation.speed`, `Formation.fireCooldown`)
- [X] T009 Crear la fábrica de estado inicial en `src/state/game-state.js` (data-model.md: `GameState.phase`, `GameState.score`, `GameState.best`, `GameState.lives`, `GameState.wave`, `GameState.ship`, `GameState.formation`, `GameState.bullets`, `GameState.invulnerabilityLeft`, `GameState.elapsedTime`)
- [X] T010 [P] Implementar el módulo de teclado en `src/input/keyboard.js` (data-model.md: `InputState.left`, `InputState.right`, `InputState.fireRequested`), aplicando la decisión R8 de `research.md`
- [X] T011 [P] Definir la paleta y los efectos neón en `src/render/theme.js`, con un único conjunto de colores y estilos
- [X] T012 [P] Pre-renderizar los sprites con resplandor en `src/render/sprites.js` (data-model.md: `Invader.kind`, `Bullet.owner`), con caché fuera de pantalla según R7
- [X] T013 Crear el renderizador base en `src/render/renderer.js` dibujando la nave, la formación y los proyectiles desde `GameState.ship`, `GameState.formation` y `GameState.bullets`
- [X] T014 Implementar el bucle de paso fijo con acumulador, límite de recuperación e interpolación en `src/core/loop.js`, según la decisión R2
- [X] T015 Crear el orquestador `step(state, input, dt)` en `src/core/game.js` con la firma pura descrita en `plan.md` y `data-model.md: GameState.phase`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Partida jugable con nave y disparos (Priority: P1) 🎯 MVP

**Goal**: Mover la nave con flechas, disparar con Space, eliminar invasores, sumar puntos y perder vidas con HUD visible.

**Independent Test**: Abrir el juego, iniciar partida, mover y disparar a la formación; verificar que un invasor desaparece, la puntuación sube y un impacto reduce una vida.

### Tests for User Story 1 ⚠️

- [X] T016 [P] [US1] Escribir pruebas de movimiento, límite lateral, pérdida de vidas e invulnerabilidad en `tests/unit/game-state.test.js` (data-model.md: `Ship.x`, `GameState.lives`, `GameState.invulnerabilityLeft`, `GameState.phase`, `GameConfig.invulnerabilityTime`)
- [X] T017 [P] [US1] Escribir pruebas de colisión, puntuación y regla de un solo disparo en `tests/unit/collision.test.js` (data-model.md: `Bullet.owner`, `Bullet.active`, `Invader.alive`, `Invader.points`, `GameState.score`, `GameState.bullets`)

### Implementation for User Story 1

- [X] T018 [US1] Implementar movimiento y límite lateral de la nave en `src/entities/ship.js` (data-model.md: `Ship.x`, `InputState.left`, `InputState.right`, `GameConfig.shipSpeed`, `GameConfig.fieldWidth`, `GameConfig.fieldHeight`)
- [X] T019 [US1] Implementar creación, avance y desactivación de proyectiles del jugador en `src/entities/bullet.js` (data-model.md: `Bullet.owner`, `Bullet.active`, `Bullet.velocityY`, `GameConfig.bulletSpeed`)
- [X] T020 [US1] Implementar resolución de impactos y suma de puntos en `src/core/game.js` (data-model.md: `Bullet.active`, `Invader.alive`, `Invader.points`, `GameState.score`, `GameState.bullets`)
- [X] T021 [US1] Implementar pérdida de vidas, invulnerabilidad y transición a fin de juego en `src/core/game.js` (data-model.md: `GameState.lives`, `GameState.invulnerabilityLeft`, `GameState.phase`, `GameConfig.initialLives`, `GameConfig.invulnerabilityTime`)
- [X] T022 [US1] Mostrar nave, proyectiles y HUD de puntuación y vidas en `src/render/renderer.js` (data-model.md: `GameState.ship`, `GameState.bullets`, `GameState.score`, `GameState.lives`)
- [X] T023 [US1] Conectar teclado, bucle y simulación en `src/core/loop.js` (data-model.md: `InputState.fireRequested`, `GameState.phase`, `GameConfig.fixedStep`), con `preventDefault` para Space según R8

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Pantalla de inicio y récord persistente (Priority: P2)

**Goal**: Mostrar una pantalla inicial con control de inicio y conservar el mejor resultado entre recargas.

**Independent Test**: Abrir el juego, iniciar desde la pantalla inicial, superar el récord, recargar y comprobar que el récord sigue visible; repetir con almacenamiento bloqueado.

### Tests for User Story 2 ⚠️

- [X] T024 [P] [US2] Escribir pruebas de lectura, validación, degradación y actualización del récord en `tests/unit/record.test.js` (data-model.md: `Record.value`, `Record.storageAvailable`, `GameState.best`, `GameConfig.maxRecord`)

### Implementation for User Story 2

- [X] T025 [P] [US2] Implementar lectura y escritura seguras del récord en `src/state/record.js` (data-model.md: `Record.value`, `Record.storageAvailable`, `GameConfig.maxRecord`), cumpliendo `contracts/storage-contract.md`
- [X] T026 [US2] Implementar pantalla de inicio y acción de comenzar en `src/ui/screens.js` (data-model.md: `GameState.phase`), según `contracts/ui-contract.md`
- [X] T027 [US2] Mostrar el récord en el HUD y en las pantallas de inicio y fin en `src/render/renderer.js` (data-model.md: `GameState.best`, `Record.value`)
- [X] T028 [US2] Actualizar el mejor resultado cuando la puntuación lo supere en `src/core/game.js` (data-model.md: `GameState.score`, `GameState.best`)
- [X] T029 [US2] Verificar los escenarios de persistencia 9 y 10 de `specs/001-space-invaders-game/quickstart.md` en Chrome y Firefox

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Oleadas progresivas y reinicio (Priority: P3)

**Goal**: Formaciones que barren, bajan y aumentan de velocidad por oleada, con pantalla final y botón de reinicio.

**Independent Test**: Eliminar una formación completa y comprobar que empieza la oleada 2; forzar el fin de juego y verificar que un solo clic en reinicio devuelve 3 vidas, 0 puntos y oleada 1 sin perder el récord.

### Tests for User Story 3 ⚠️

- [X] T030 [P] [US3] Escribir pruebas de barrido, inversión, descenso y escalado de oleadas en `tests/unit/formation.test.js` (data-model.md: `Formation.offsetX`, `Formation.offsetY`, `Formation.direction`, `Formation.stepDown`, `Formation.speed`, `Formation.enemies`, `GameConfig.formationRows`, `GameConfig.formationCols`, `GameConfig.waveSpeedBase`, `GameConfig.waveSpeedGrowth`, `GameConfig.waveSpeedMax`)

### Implementation for User Story 3

- [X] T031 [US3] Implementar barrido lateral, inversión en borde y descenso escalonado en `src/entities/formation.js` (data-model.md: `Formation.offsetX`, `Formation.offsetY`, `Formation.direction`, `Formation.stepDown`, `Formation.speed`, `Formation.enemies`)
- [X] T032 [US3] Implementar cadencia de disparo enemigo en `src/entities/formation.js` (data-model.md: `Formation.fireCooldown`, `Bullet.owner`, `GameConfig.enemyFireInterval`)
- [X] T033 [US3] Implementar avance de oleada y velocidad creciente con techo en `src/core/game.js` (data-model.md: `GameState.wave`, `Formation.wave`, `Formation.speed`, `GameConfig.waveSpeedBase`, `GameConfig.waveSpeedGrowth`, `GameConfig.waveSpeedMax`)
- [X] T034 [US3] Implementar penalización cuando un invasor alcanza la zona inferior en `src/core/game.js` (data-model.md: `GameState.lives`, `Formation.offsetY`, `GameConfig.fieldHeight`)
- [X] T035 [US3] Implementar panel de fin de juego y botón de reinicio en `src/ui/screens.js` (data-model.md: `GameState.phase`, `GameState.score`, `GameState.best`, `GameState.lives`)
- [X] T036 [US3] Implementar reinicio idempotente que conserva el récord en `src/core/game.js` (data-model.md: `GameState.phase`, `GameState.lives`, `GameState.score`, `GameState.wave`, `GameState.best`, `GameConfig.initialLives`)
- [X] T037 [P] [US3] Mostrar el número de oleada en el HUD y el resultado final en `src/render/renderer.js` (data-model.md: `GameState.wave`, `GameState.phase`)

**Checkpoint**: All user stories are now independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación integral, rendimiento y cumplimiento de la constitución

- [X] T038 [P] Ejecutar los 12 escenarios de validación de `specs/001-space-invaders-game/quickstart.md` en Chrome y Firefox
- [X] T039 [P] Medir el ritmo de fotogramas en `src/core/loop.js` y confirmar 60 FPS en `index.html` según `plan.md`
- [X] T040 [P] Auditar `index.html` y `src/` para confirmar cero peticiones de red y consola sin errores
- [X] T041 Verificar que ningún archivo de `src/` supera 300 líneas y revisar el cumplimiento constitucional en `plan.md`
- [X] T042 Ejecutar `node --test tests/unit/*.test.js` desde la raíz y corregir los fallos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; puede empezar de inmediato
- **Foundational (Phase 2)**: Depende de Setup; BLOCKS todas las historias
- **User Stories (Phases 3-5)**: Dependen de Foundational; pueden ejecutarse en paralelo si hay capacidad, o en orden P1 → P2 → P3
- **Polish (Phase 6)**: Depende de que las historias deseadas estén completas

### User Story Dependencies

- **User Story 1 (P1)**: Tras Foundational; sin dependencias de otras historias
- **User Story 2 (P2)**: Tras Foundational; usa el HUD y el estado creados en US1, pero es verificable por separado
- **User Story 3 (P3)**: Tras Foundational; usa la formación y el bucle de US1, pero es verificable por separado

### Within Each User Story

- Pruebas primero: deben fallar antes de la implementación
- Fábricas de entidades antes que reglas de simulación
- Simulación antes que renderizado
- Renderizado antes que cableado de eventos
- Historia completa antes de pasar a la siguiente prioridad

### Parallel Opportunities

- T002 y T003 pueden ejecutarse en paralelo tras T001
- T005, T006, T007, T010, T011 y T012 pueden ejecutarse en paralelo dentro de Foundational
- Las pruebas de cada historia marcadas [P] pueden escribirse en paralelo
- Las tres historias pueden avanzar en paralelo una vez completada Foundational
- Las tareas de Polish marcadas [P] pueden ejecutarse simultáneamente

---

## Parallel Example: User Story 1

```bash
Task: "Escribir pruebas de movimiento, vidas e invulnerabilidad en tests/unit/game-state.test.js"
Task: "Escribir pruebas de colisión y puntuación en tests/unit/collision.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "Escribir pruebas de récord en tests/unit/record.test.js"
Task: "Implementar persistencia en src/state/record.js"
Task: "Implementar pantalla de inicio en src/ui/screens.js"
```

## Parallel Example: User Story 3

```bash
Task: "Escribir pruebas de formación en tests/unit/formation.test.js"
Task: "Mostrar oleada y resultado en src/render/renderer.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRITICAL)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: probar US1 de forma independiente
5. Demo del MVP abriendo `index.html`

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → demo (MVP)
3. US2 → validar → demo
4. US3 → validar → demo
5. Cada historia añade valor sin romper las anteriores

### Parallel Team Strategy

1. El equipo completa Setup y Foundational juntos
2. Tras Foundational: desarrollador A en US1, B en US2, C en US3
3. Integración y validación independiente de cada historia

---

## Notes

- [P] = archivos distintos, sin dependencias entre tareas
- [Story] traza cada tarea hasta su historia en `spec.md`
- Las citas `data-model.md: Entity.field` son canonicales; no duplicar restricciones
- Cada historia puede detenerse y validarse en su checkpoint
- No crear `package.json`: `node --test` no requiere instalación
- Commitear después de cada tarea o grupo lógico de tareas
