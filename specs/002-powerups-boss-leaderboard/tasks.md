# Tasks: Power-ups, jefes y tabla de mejores puntajes

**Input**: Design documents from `/specs/002-powerups-boss-leaderboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos porque la constitución exige pruebas deterministas para
cambios de reglas. Escribir primero las pruebas de cada historia y comprobar que
fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario para permitir
implementación y validación independientes. Las citas `data-model.md` →
`Entidad.campo` identifican las restricciones canónicas de cada campo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (`US1`, `US2`, `US3`)
- Cada tarea incluye la ruta exacta del archivo afectado

## Path Conventions

- Proyecto único estático: `src/`, `tests/`, `styles/` e `index.html` en la raíz.
- Scripts clásicos con APIs en `globalThis.JuegoIA` y `module.exports` para Node.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Constantes y utilidades compartidas por las tres historias.

- [ ] T001 [P] Añadir en `src/core/config.js` los campos nuevos de `data-model.md` → `GameConfig.powerUpDropChance`, `GameConfig.powerUpFallSpeed`, `GameConfig.powerUpSize`, `GameConfig.maxPowerUps`, `GameConfig.doubleShotDuration`, `GameConfig.shieldDuration`, `GameConfig.maxLives`, `GameConfig.extraLifeBonus`, `GameConfig.bossEvery`, `GameConfig.bossBaseHealth`, `GameConfig.bossHealthGrowth`, `GameConfig.bossBasePoints`, `GameConfig.bossPointsGrowth`, `GameConfig.bossSpeed`, `GameConfig.bossSpeedGrowth`, `GameConfig.bossSpeedMax`, `GameConfig.bossFireInterval`, `GameConfig.bossFireIntervalStep`, `GameConfig.bossFireIntervalMin`, `GameConfig.bossWidth`, `GameConfig.bossHeight`, `GameConfig.bossTop`, `GameConfig.leaderboardSize`, `GameConfig.maxWave` y `GameConfig.randomSeed`, conservando `Object.freeze`.
- [ ] T002 [P] Crear `src/core/geometry.js` con la función pura `overlaps(a, b)` de colisión AABB, según `contracts/gameplay-contract.md` → `src/core/geometry.js`.
- [ ] T003 [P] Añadir en `src/render/theme.js` los colores de power-ups, jefe, núcleo, barra de vida, fondo de barra y aura de escudo, manteniendo la paleta neón existente.

**Checkpoint**: Constantes y utilidades listas para las historias.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estado y conteo de proyectiles que necesitan todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

- [ ] T004 Extender `src/state/game-state.js` con `boss: null`, `powerUps: []`, `effects: { doubleShot: 0, shield: 0 }` y `rngState: config.randomSeed`; respetar `data-model.md` → `GameState.phase`, `GameState.score`, `GameState.best`, `GameState.lives`, `GameState.wave`, `GameState.formation`, `GameState.boss`, `GameState.powerUps`, `GameState.effects`, `GameState.rngState`, `GameState.invulnerabilityLeft` y los límites de `Ship.x`/`Ship.speed`.
- [ ] T005 [P] Añadir `countActivePlayerBullets(bullets)` en `src/entities/bullet.js` y conservar `createBullet`/`advanceBullet`; respetar `data-model.md` → `Bullet.owner` y `Bullet.active`.

**Checkpoint**: Estado base listo; US1, US2 y US3 pueden comenzar.

---

## Phase 3: User Story 1 - Power-ups al destruir enemigos (Priority: P1) 🎯 MVP

**Goal**: Los enemigos destruidos pueden soltar disparo doble, escudo temporal o
vida extra; la nave los recoge y el HUD muestra los efectos activos.

**Independent Test**: Destruir enemigos hasta recoger cada tipo, comprobar el
efecto, la cuenta atrás y la expiración; ejecutar
`node --test tests/unit/powerups.test.js tests/unit/collision.test.js tests/unit/game-state.test.js`.

### Tests for User Story 1

- [ ] T006 [P] [US1] Añadir pruebas de drops, caída, recogida, renovación, vida extra con tope, escudo y disparo doble en `tests/unit/powerups.test.js`; cubrir `data-model.md` → `PowerUp.type`, `PowerUp.active`, `PowerUp.velocityY`, `ActiveEffects.doubleShot`, `ActiveEffects.shield`, `GameConfig.powerUpDropChance`, `GameConfig.maxPowerUps`, `GameConfig.maxLives` y `GameConfig.extraLifeBonus`.
- [ ] T007 [P] [US1] Actualizar `tests/unit/collision.test.js` para verificar que el disparo doble crea dos proyectiles, respeta el límite de salva y vuelve a uno al expirar; cubrir `data-model.md` → `Bullet.owner`, `Bullet.active` y `ActiveEffects.doubleShot`.
- [ ] T008 [P] [US1] Actualizar `tests/unit/game-state.test.js` para verificar escudo frente a `loseLife`, decremento de efectos con `dt`, vida extra y reinicio que limpia efectos; cubrir `data-model.md` → `GameState.effects`, `GameState.lives`, `GameState.invulnerabilityLeft`, `ActiveEffects.shield` y `GameConfig.maxLives`.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Crear `src/entities/powerup.js` con `createPowerUp` y `advancePowerUp`; respetar `data-model.md` → `PowerUp.id`, `PowerUp.type`, `PowerUp.x`, `PowerUp.y`, `PowerUp.prevX`, `PowerUp.prevY`, `PowerUp.width`, `PowerUp.height`, `PowerUp.velocityY` y `PowerUp.active`.
- [ ] T010 [US1] Implementar `src/core/powerups.js` con `nextRandom`, `maybeDrop`, `dropPowerUp`, `advancePowerUps`, `updateEffects`, `isShieldActive` e `isDoubleShotActive`; respetar `data-model.md` → `GameState.rngState`, `GameState.powerUps`, `GameState.effects`, `PowerUp.*`, `ActiveEffects.doubleShot`, `ActiveEffects.shield` y `GameConfig.powerUpDropChance`, `GameConfig.powerUpFallSpeed`, `GameConfig.maxPowerUps`, `GameConfig.doubleShotDuration`, `GameConfig.shieldDuration`, `GameConfig.maxLives`, `GameConfig.extraLifeBonus` y `GameConfig.randomSeed`.
- [ ] T011 [US1] Crear `src/core/combat.js` con `resolvePlayerShots` para impactos jugador→enemigo, puntos, `best` y drop de power-up; respetar `data-model.md` → `Invader.alive`, `Invader.points`, `GameState.score`, `GameState.best`, `GameState.phase` y `PowerUp.active`.
- [ ] T012 [US1] Integrar power-ups en `src/core/game.js`: actualizar efectos, avanzar/recoger power-ups, permitir hasta dos proyectiles con disparo doble, aplicar escudo en `loseLife`, limpiar efectos al iniciar y mantener la formación; respetar `data-model.md` → `GameState.powerUps`, `GameState.effects`, `GameState.lives`, `GameState.invulnerabilityLeft`, `Ship.x`, `GameConfig.maxPowerUps`, `GameConfig.doubleShotDuration`, `GameConfig.shieldDuration`, `GameConfig.maxLives` y `GameConfig.extraLifeBonus`.
- [ ] T013 [P] [US1] Añadir a `src/render/sprites.js` los tres iconos de power-up (dos barras, anillo y cruz) con caché fuera de pantalla; usar `data-model.md` → `PowerUp.type` para el mapeo visual.
- [ ] T014 [US1] Actualizar `src/render/renderer.js` para dibujar power-ups interpolados, la lista de efectos activos con segundos restantes y el aura de escudo; respetar `data-model.md` → `PowerUp.prevX`, `PowerUp.prevY`, `PowerUp.active`, `GameState.effects`, `ActiveEffects.doubleShot` y `ActiveEffects.shield`.
- [ ] T015 [US1] Actualizar `src/core/loop.js` para marcar `prevX`/`prevY` de los power-ups antes de cada paso y mantener el conteo de proyectiles para el sonido de disparo; cubrir `data-model.md` → `PowerUp.prevX`, `PowerUp.prevY`, `Bullet.owner` y `Bullet.active`.
- [ ] T016 [US1] Añadir en `index.html` los `<script>` de `src/core/geometry.js`, `src/entities/powerup.js`, `src/core/powerups.js` y `src/core/combat.js` en orden de dependencia.
- [ ] T017 [US1] Validar US1 de forma independiente con `node --test tests/unit/powerups.test.js tests/unit/collision.test.js tests/unit/game-state.test.js` y una partida en `index.html`; corregir cualquier regresión antes del checkpoint.

**Checkpoint**: US1 funcional y demostrable por sí sola.

---

## Phase 4: User Story 2 - Jefe final cada 3 oleadas (Priority: P2)

**Goal**: Cada tercera oleada aparece un jefe con barra de vida, ataques y
dificultad creciente; al derrotarlo se obtienen puntos, un power-up y la
siguiente oleada.

**Independent Test**: Alcanzar la oleada 3, comprobar la aparición del jefe y su
barra, reducir su vida con disparos y verificar recompensa y avance; ejecutar
`node --test tests/unit/boss.test.js tests/unit/collision.test.js tests/unit/game-state.test.js`.

### Tests for User Story 2

- [ ] T018 [P] [US2] Añadir pruebas de oleada de jefe, escalado de vida/puntos/velocidad/cadencia, movimiento con rebote y disparo en `tests/unit/boss.test.js`; cubrir `data-model.md` → `Boss.health`, `Boss.maxHealth`, `Boss.points`, `Boss.speed`, `Boss.direction`, `Boss.fireInterval`, `Boss.fireCooldown`, `Boss.wave`, `Boss.encounter`, `GameConfig.bossEvery`, `GameConfig.bossBaseHealth`, `GameConfig.bossHealthGrowth`, `GameConfig.bossBasePoints`, `GameConfig.bossPointsGrowth`, `GameConfig.bossSpeed`, `GameConfig.bossSpeedGrowth`, `GameConfig.bossSpeedMax`, `GameConfig.bossFireInterval`, `GameConfig.bossFireIntervalStep` y `GameConfig.bossFireIntervalMin`.
- [ ] T019 [P] [US2] Ampliar `tests/unit/collision.test.js` con impactos al jefe, derrota con recompensa/drop y precedencia cuando la última vida cae en el mismo paso; cubrir `data-model.md` → `Boss.health`, `Boss.alive`, `Boss.rewarded`, `Boss.points`, `GameState.phase`, `GameState.score` y `GameState.best`.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Crear `src/entities/boss.js` con `isBossWave`, `createBoss`, `stepBoss` y `consumeBossFire`; respetar `data-model.md` → `Boss.wave`, `Boss.encounter`, `Boss.x`, `Boss.y`, `Boss.prevX`, `Boss.width`, `Boss.height`, `Boss.health`, `Boss.maxHealth`, `Boss.alive`, `Boss.rewarded`, `Boss.points`, `Boss.speed`, `Boss.direction`, `Boss.fireInterval` y `Boss.fireCooldown`.
- [ ] T021 [P] [US2] Añadir `createEmptyFormation(wave, config)` en `src/entities/formation.js` para oleadas de jefe; respetar `data-model.md` → `Formation.enemies`, `Formation.offsetX`, `Formation.offsetY`, `Formation.direction`, `Formation.speed` y `Formation.fireCooldown`.
- [ ] T022 [US2] Ampliar `src/core/combat.js` con el daño al jefe y `finalizeBossDefeat` (puntos, `best`, drop y marca `rewarded`); respetar `data-model.md` → `Boss.health`, `Boss.alive`, `Boss.rewarded`, `Boss.points`, `GameState.phase`, `GameState.score` y `GameState.best`.
- [ ] T023 [US2] Integrar el jefe en `src/core/game.js` con `startWave`, movimiento/disparo del jefe, daño por proyectil/contacto, avance tras la derrota y conservación de vida del jefe al perder una vida; respetar `data-model.md` → `GameState.boss`, `GameState.wave`, `Boss.alive`, `Boss.health`, `Boss.y`, `GameConfig.bossEvery`, `GameConfig.bossTop` y `GameConfig.bossWidth`.
- [ ] T024 [P] [US2] Añadir a `src/render/sprites.js` el sprite del jefe con cuerpo, núcleo y ojos; usar `data-model.md` → `Boss.width` y `Boss.height` para el tamaño.
- [ ] T025 [US2] Actualizar `src/render/renderer.js` para dibujar al jefe interpolado y la barra de vida con estado actual/máximo; respetar `data-model.md` → `Boss.prevX`, `Boss.health`, `Boss.maxHealth` y `Boss.alive`.
- [ ] T026 [US2] Actualizar `src/core/loop.js` para marcar `prevX` del jefe antes de cada paso; cubrir `data-model.md` → `Boss.prevX` y `Boss.x`.
- [ ] T027 [US2] Añadir en `index.html` el `<script>` de `src/entities/boss.js` después de la formación.
- [ ] T028 [US2] Ampliar `tests/unit/game-state.test.js` con la transición a oleada de jefe, el avance tras la derrota y la conservación de vida del jefe al perder una vida; cubrir `data-model.md` → `GameState.wave`, `GameState.boss`, `Boss.health` y `Boss.alive`.
- [ ] T029 [US2] Validar US2 de forma independiente con `node --test tests/unit/boss.test.js tests/unit/collision.test.js tests/unit/game-state.test.js` y una partida hasta la oleada 3; corregir regresiones antes del checkpoint.

**Checkpoint**: US1 y US2 funcionan juntas y US2 puede demostrarse de forma aislada.

---

## Phase 5: User Story 3 - Tabla de los 5 mejores puntajes (Priority: P3)

**Goal**: Persistir los cinco mejores resultados, mostrarlos en inicio y fin, y
destacar la entrada nueva.

**Independent Test**: Jugar varias partidas, comprobar orden, recorte a cinco,
persistencia tras recarga y degradación con almacenamiento bloqueado; ejecutar
`node --test tests/unit/leaderboard.test.js`.

### Tests for User Story 3

- [ ] T030 [P] [US3] Añadir pruebas de validación, orden, recorte a cinco, persistencia, corrupción y almacenamiento bloqueado en `tests/unit/leaderboard.test.js`; cubrir `data-model.md` → `LeaderboardEntry.score`, `LeaderboardEntry.wave`, `LeaderboardEntry.date`, `LeaderboardLoadResult.entries`, `LeaderboardLoadResult.storageAvailable`, `LeaderboardAddResult.entries`, `LeaderboardAddResult.highlightIndex`, `LeaderboardAddResult.entry`, `LeaderboardAddResult.storageAvailable`, `GameConfig.leaderboardSize`, `GameConfig.maxWave` y `GameConfig.maxRecord`.
- [ ] T031 [US3] Retirar `tests/unit/record.test.js` porque la tabla sustituye al récord único y su cobertura pasa a `tests/unit/leaderboard.test.js`.

### Implementation for User Story 3

- [ ] T032 [P] [US3] Crear `src/state/leaderboard.js` con `KEY`, `normalizeEntry`, `normalizeEntries`, `compare`, `today` y `createLeaderboardStore`; respetar `data-model.md` → `LeaderboardEntry.score`, `LeaderboardEntry.wave`, `LeaderboardEntry.date`, `LeaderboardLoadResult.entries`, `LeaderboardLoadResult.storageAvailable`, `LeaderboardAddResult.entries`, `LeaderboardAddResult.highlightIndex`, `LeaderboardAddResult.entry`, `LeaderboardAddResult.storageAvailable`, `GameConfig.leaderboardSize`, `GameConfig.maxWave` y `GameConfig.maxRecord`.
- [ ] T033 [US3] Actualizar `src/ui/screens.js` para renderizar la tabla en `start-scores` y `final-scores`, mostrar el estado vacío y destacar la fila nueva; usar `data-model.md` → `LeaderboardEntry.score`, `LeaderboardEntry.wave`, `LeaderboardEntry.date` y `LeaderboardAddResult.highlightIndex`.
- [ ] T034 [P] [US3] Añadir en `styles/main.css` los estilos de tabla, estado vacío y `score-row--new`, manteniendo la paleta neón y el ajuste a 960 × 600.
- [ ] T035 [US3] Actualizar `index.html` con las tablas de inicio y fin (`start-scores`, `final-scores`), el aviso `final-note` y el `<script>` de `src/state/leaderboard.js`; retirar los elementos de récord único de las pantallas.
- [ ] T036 [US3] Integrar la tabla en `src/core/loop.js` y en el arranque de `index.html`: usar `leaderboard` en lugar de `store`, añadir la entrada al terminar, derivar `best` de la primera posición y pasar el resultado a `screens.showGameOver`; respetar `data-model.md` → `LeaderboardAddResult.entries`, `LeaderboardAddResult.highlightIndex`, `LeaderboardAddResult.entry`, `LeaderboardAddResult.storageAvailable`, `LeaderboardLoadResult.entries` y `LeaderboardLoadResult.storageAvailable`.
- [ ] T037 [US3] Eliminar `src/state/record.js` y retirar sus referencias y su `<script>` de `index.html`, dejando la tabla como única persistencia.
- [ ] T038 [US3] Validar US3 de forma independiente con `node --test tests/unit/leaderboard.test.js`, varias partidas en `index.html`, recarga y prueba de almacenamiento corrupto/bloqueado; corregir regresiones antes del checkpoint.

**Checkpoint**: Las tres historias funcionan de forma integrada.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final, rendimiento y consistencia documental.

- [ ] T039 [P] Ejecutar `node --test tests/unit/*.test.js` y corregir cualquier regresión de las pruebas existentes o nuevas.
- [ ] T040 [P] Verificar que cada archivo de `src/` y `tests/unit/` respeta el límite de 300 líneas y que el orden de `<script>` de `index.html` coincide con las dependencias de `specs/002-powerups-boss-leaderboard/plan.md`.
- [ ] T041 [P] Validar en Chrome y Firefox abriendo `index.html`: sin errores de consola, sin peticiones de red, power-ups visibles, jefe en oleada 3 con barra, tabla persistente y 60 FPS con varios efectos activos.
- [ ] T042 [P] Recorrer `specs/002-powerups-boss-leaderboard/quickstart.md` y actualizar la guía si algún escenario o resultado esperado no coincide con la implementación.
- [ ] T043 [P] Auditar las citas de `data-model.md`: confirmar que todos los campos restringidos de `GameConfig`, `GameState`, `PowerUp`, `ActiveEffects`, `Boss`, `Formation`, `Bullet`, `Invader` y `LeaderboardEntry`/resultados tienen al menos una tarea de implementación que los cita; añadir la cita que falte en `specs/002-powerups-boss-leaderboard/tasks.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001, T002 y T003 pueden ir en paralelo.
- **Foundational (Phase 2)**: depende de Setup; T004 depende de T001 y T005 puede ir en paralelo con T004.
- **US1 (Phase 3)**: depende de Foundational; es el MVP y debe completarse antes de US2 por los archivos compartidos.
- **US2 (Phase 4)**: depende de US1 porque extiende `combat.js`, `game.js`, `renderer.js`, `sprites.js`, `loop.js`, `index.html` y `game-state.test.js`.
- **US3 (Phase 5)**: el módulo, las pruebas, la tabla y el CSS pueden empezar tras Foundational; la integración en `loop.js`/`index.html` debe hacerse después de US1 y US2 para evitar conflictos.
- **Polish (Phase 6)**: depende de las tres historias.

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational; no depende de US2 ni US3.
- **US2 (P2)**: depende de US1 por los módulos y archivos compartidos, pero se valida con su propia suite y una partida hasta la oleada 3.
- **US3 (P3)**: el almacenamiento y la UI son independientes; la integración final comparte `loop.js` e `index.html` con US1/US2.

### Within Each User Story

- Las pruebas se escriben antes y deben fallar.
- Entidades antes de servicios; servicios antes de la integración en `game.js`.
- Render después de las entidades y del estado.
- Validación independiente antes del checkpoint.

### Parallel Opportunities

- Setup: T001, T002 y T003 en paralelo.
- Foundational: T004 y T005 en paralelo.
- US1: T006, T007 y T008 en paralelo; T009 y T013 en paralelo.
- US2: T018 y T019 en paralelo; T020, T021 y T024 en paralelo.
- US3: T030, T032 y T034 en paralelo.
- Polish: T039, T040, T041, T042 y T043 en paralelo tras completar las historias.

### Shared Files (no paralelizar)

`src/core/game.js`, `src/core/combat.js`, `src/core/loop.js`,
`src/render/sprites.js`, `src/render/renderer.js`, `index.html`,
`src/state/game-state.js` y `tests/unit/game-state.test.js` se editan en varias
historias; sus tareas deben ejecutarse en el orden indicado.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 en paralelo:
node --test tests/unit/powerups.test.js
node --test tests/unit/collision.test.js
node --test tests/unit/game-state.test.js

# Entidad y sprites en paralelo (archivos distintos):
# T009 src/entities/powerup.js
# T013 src/render/sprites.js
```

## Parallel Example: User Story 2

```bash
# Pruebas y entidades base en paralelo:
# T018 tests/unit/boss.test.js
# T019 tests/unit/collision.test.js
# T020 src/entities/boss.js
# T021 src/entities/formation.js
# T024 src/render/sprites.js
```

## Parallel Example: User Story 3

```bash
# Módulo, pruebas y estilos en paralelo:
# T030 tests/unit/leaderboard.test.js
# T032 src/state/leaderboard.js
# T034 styles/main.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup y Foundational.
2. Completar US1 (power-ups) y validar con su suite y una partida.
3. Demostrar el MVP: drops, disparo doble, escudo, vida extra y HUD.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → demo del MVP.
3. US2 → validar oleada 3 y recompensa → demo.
4. US3 → validar tabla y persistencia → demo.
5. Polish → pruebas completas, navegadores, rendimiento y documentación.

### Parallel Team Strategy

1. El equipo completa Setup + Foundational.
2. US1 primero por los archivos compartidos.
3. US2 después de US1.
4. US3 puede preparar módulo/pruebas/CSS en paralelo, pero integra al final.
5. Polish en paralelo tras las tres historias.

---

## Notes

- `[P]` indica archivos distintos y ausencia de dependencias pendientes.
- Cada historia tiene una suite y un criterio de validación independiente.
- No se añade audio nuevo; se reutilizan los efectos existentes cuando el
  cambio de puntuación o de vidas lo justifica.
- La tabla es la única persistencia de puntuaciones; la clave antigua no se
  migra.
- Verificar que las pruebas fallan antes de implementar y que el juego sigue
  abriendo desde `file://` sin servidor.

## Format Validation

- [x] Todas las tareas usan `- [ ] TNNN` con identificador secuencial.
- [x] Las tareas de historia incluyen `[US1]`, `[US2]` o `[US3]`.
- [x] Las tareas paralelas incluyen `[P]` solo cuando no comparten archivo.
- [x] Todas las tareas indican una ruta de archivo concreta.
- [x] Las fases siguen Setup → Foundational → US1 → US2 → US3 → Polish.
