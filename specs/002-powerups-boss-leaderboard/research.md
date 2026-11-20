# Research: Power-ups, jefes y tabla de mejores puntajes

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`
**Date**: 2026-11-19

## R1 — Separación de módulos sin superar 300 líneas

- **Decision**: Mantener `game.js` como orquestador y extraer tres módulos:
  `src/core/powerups.js` (RNG, drops, recogida y temporizadores),
  `src/core/combat.js` (impactos del jugador y cierre del jefe) y
  `src/core/geometry.js` (colisión AABB compartida). Las entidades nuevas viven
  en `src/entities/powerup.js` y `src/entities/boss.js`.
- **Rationale**: `game.js` ya tiene 207 líneas; añadir power-ups, jefe y sus
  transiciones lo acercaría o superaría el límite constitucional. La separación
  deja responsabilidades claras y permite probar cada sistema por separado.
- **Alternatives considered**:
  - Concentrar todo en `game.js`: simple de localizar, pero viola el límite de
    300 líneas y mezcla simulación, drops y persistencia.
  - Un único módulo `entities.js`: reduce archivos, pero acopla entidades sin
    relación y dificulta las pruebas.
- **Risks**: Hay que respetar el orden de carga de scripts clásicos y evitar
  dependencias circulares; `combat` puede depender de `powerups`, pero no al
  revés.

## R2 — Drops deterministas con generador pseudoaleatorio

- **Decision**: Añadir `state.rngState` inicializado con
  `config.randomSeed` y un LCG de 32 bits (`state * 1664525 + 1013904223`). Cada
  enemigo destruido consume una tirada; si es menor que
  `config.powerUpDropChance` (0,15), se elige el tipo con la siguiente tirada.
  `maybeDrop` acepta una tirada opcional para las pruebas.
- **Rationale**: El principio IV exige simulación determinista y pruebas sin
  DOM. `Math.random()` haría que el resultado dependiera del entorno y no sería
  reproducible. El LCG es pequeño, rápido y suficiente para una decisión
  binaria; la semilla fija hace que cada partida siga la misma secuencia, lo
  que también facilita la depuración.
- **Alternatives considered**:
  - `Math.random()`: no determinista y no verificable en pruebas.
  - Drop por cada N enemigos: determinista, pero se aleja del 15 % y hace el
    ritmo predecible de forma trivial.
  - Inyectar una función aleatoria en `step`: más flexible, pero amplía la
    firma pública y complica todos los llamadores.
- **Risks**: Una semilla fija permite anticipar la secuencia; es aceptable para
  un juego local y se puede cambiar la constante sin tocar la lógica.

## R3 — Modelo de efectos temporales

- **Decision**: Guardar `state.effects = { doubleShot: 0, shield: 0 }` con
  segundos restantes. `updateEffects` resta `dt` y satura en 0. El escudo está
  activo mientras `shield > 0`; el disparo doble mientras `doubleShot > 0`.
  Recoger el mismo tipo reasigna la duración completa. Los efectos no se apilan.
- **Rationale**: Dos números son suficientes, se serializan sin esfuerzo y
  permiten que el HUD muestre la cuenta atrás. Un escudo temporal (no un número
  de impactos) coincide con la descripción "escudo temporal" y con el caso
  límite de renovación.
- **Alternatives considered**:
  - Escudo por impactos: cambia el comportamiento esperado y exige contadores
    adicionales.
  - Lista genérica de efectos: flexible pero innecesaria para dos mejoras.
  - Duraciones acumulativas: permitirían encadenar power-ups indefinidamente y
    contradicen el caso límite de renovación.
- **Risks**: Si un efecto expira mientras la nave se solapa con un enemigo, el
  daño se aplica en el siguiente paso; es coherente con la simulación discreta.

## R4 — Disparo doble y control de salva

- **Decision**: `bullet.countActivePlayerBullets` cuenta proyectiles activos.
  `fire` permite disparar si el conteo es menor que 2 con disparo doble activo
  y menor que 1 en caso normal. Al disparar con la mejora se crean dos
  proyectiles separados 8 px del centro. `fire` devuelve la lista de proyectiles
  creados (vacía si no se permite disparar).
- **Rationale**: Mantiene la regla de "una salva activa" sin permitir spam: con
  disparo doble hay hasta dos proyectiles, no disparos ilimitados. El conteo es
  más simple y robusto que un temporizador de cadencia y encaja con el bucle de
  entrada actual.
- **Alternatives considered**:
  - Cadencia de disparo más corta: cambia el equilibrio y no produce dos
    proyectiles simultáneos.
  - Permitir dos proyectiles incluso sin la mejora: rompe la especificación.
  - Devolver solo el primer proyectil: oculta el segundo y complica las
    pruebas; se devuelve la lista.
- **Risks**: Al expirar la mejora con dos proyectiles en vuelo, no se podrá
  disparar hasta que quede uno; es una consecuencia aceptable y predecible.

## R5 — Representación del jefe y transición de oleada

- **Decision**: `state.boss` es `null` en oleadas normales y un objeto en
  oleadas múltiplo de 3. En una oleada de jefe, `state.formation` es una
  formación vacía (misma estructura, sin enemigos) para no romper el render ni
  el estado existente. `boss.js` decide `isBossWave`, crea al jefe con vida,
  velocidad, cadencia y puntos escalados, y lo mueve horizontalmente sin
  descender. `game.startWave` elige formación normal o jefe.
- **Rationale**: Reutiliza la estructura de estado y el render sin introducir
  una fase nueva. La formación vacía evita que `checkWaveProgress` avance la
  oleada por "cero enemigos" y permite que la lógica del jefe controle el final.
- **Alternatives considered**:
  - Añadir una fase `boss`: obliga a duplicar el flujo de `step` y de render.
  - Reutilizar un invasor gigante dentro de `formation.enemies`: complica
    colisiones, barra de vida y recuento de oleada.
  - Mantener la formación normal junto al jefe: duplica la dificultad y
    contradice "en lugar de la formación habitual".
- **Risks**: Hay que omitir el paso de formación y el chequeo de descenso
  cuando hay jefe; se centraliza en `game.js` para evitar ramas dispersas.

## R6 — Precedencia entre derrota del jefe y fin de partida

- **Decision**: Los impactos del jugador reducen la vida del jefe y, al llegar a
  cero, marcan `boss.alive = false` sin otorgar puntos todavía. Después de
  resolver el daño al jugador, `finalizeBossDefeat` solo concede puntos y drop
  si `phase` sigue siendo `playing`. Si el jugador perdió la última vida en ese
  mismo paso, no hay recompensa ni avance de oleada.
- **Rationale**: Cumple el caso límite de la especificación sin reordenar las
  colisiones existentes. Marcar `alive = false` de inmediato evita que el jefe
  siga disparando o dañando después del impacto final.
- **Alternatives considered**:
  - Otorgar la recompensa al detectar vida 0: incumple la precedencia pedida.
  - Resolver primero el daño al jugador: cambia el orden actual y podría impedir
    que un disparo legítimo cuente.
- **Risks**: Hay que asegurar que `checkWaveProgress` no avance si la partida
  terminó; se comprueba `phase` antes de avanzar.

## R7 — Esquema y orden de la tabla de puntajes

- **Decision**: Guardar un arreglo JSON de hasta cinco entradas
  `{ score, wave, date }` bajo `juegoia.space-invaders.leaderboard`. `date` es
  una fecha local `YYYY-MM-DD`. Se ordena por puntuación descendente, luego por
  oleada descendente y luego por fecha ascendente. Solo se aceptan puntuaciones
  enteras mayores que 0 y hasta `maxRecord`. La clave antigua del récord no se
  migra.
- **Rationale**: Un arreglo pequeño es fácil de validar y de mantener. El orden
  de desempate es explícito y verificable. No migrar evita introducir una
  entrada artificial con oleada desconocida y mantiene el alcance.
- **Alternatives considered**:
  - Mantener el récord y añadir una tabla aparte: duplica la fuente de verdad y
    contradice FR-023.
  - Guardar un objeto con metadatos de versión: útil para migraciones futuras,
    pero innecesario para cinco enteros y una fecha.
  - Ordenar solo por puntuación: deja empates sin criterio estable.
- **Risks**: Reloj local incorrecto puede producir fechas raras; solo afecta al
  desempate y no impide jugar. Se valida el formato y se descartan fechas
  inválidas.

## R8 — Tabla en las pantallas y fila destacada

- **Decision**: La tabla se renderiza en `screens.js` dentro de dos `<tbody>`
  (`start-scores` y `final-scores`) usando `createElement` y `textContent`. Se
  muestran cuatro columnas: puesto, puntos, oleada y fecha. Si no hay entradas,
  una fila con `colspan="4"` indica "Aún no hay puntuaciones". En la pantalla
  final, la entrada nueva recibe la clase `score-row--new`; si no calificó, no
  se destaca ninguna.
- **Rationale**: La tabla debe ser legible, accesible y actualizarse sin
  reconstruir toda la pantalla. `textContent` evita inyección de HTML aunque los
  datos sean locales. La clase CSS mantiene el estilo neón.
- **Alternatives considered**:
  - Generar la tabla en Canvas: complica accesibilidad, selección de texto y
    diseño responsive.
  - Usar `innerHTML` con plantillas: más compacto, pero innecesariamente
    arriesgado.
  - Mostrar solo la mejor puntuación: incumple la tabla de cinco.
- **Risks**: La pantalla de inicio debe caber en 600 px de alto; se reduce el
  espaciado y el tamaño de la tabla en CSS.

## R9 — Render de power-ups, jefe y efectos sin romper 60 FPS

- **Decision**: Añadir sprites procedurales en caché para los tres power-ups y
  el jefe, dibujar la barra de vida y los temporizadores con Canvas, y usar un
  aura de escudo alrededor de la nave. El bucle marca `prevX`/`prevY` de
  power-ups y `prevX` del jefe para interpolar. Los power-ups se limitan a 8.
- **Rationale**: Mantiene el coste de dibujo acotado y coherente con la estética
  existente. La caché evita `shadowBlur` por fotograma, que es el coste más
  alto. La interpolación evita saltos a 120 Hz.
- **Alternatives considered**:
  - Dibujar con formas y sombras cada fotograma: simple pero costoso.
  - Añadir imágenes externas: rompe la operación offline y la autocontención.
  - No interpolar: produce tirones visibles.
- **Risks**: El aura y la barra añaden pocas operaciones; se dibujan solo cuando
  el efecto o el jefe están activos.

## R10 — Estrategia de pruebas

- **Decision**: Probar reglas puras con `node:test`: drops con tirada forzada,
  recogida y renovación, vida extra con tope, escudo frente a `loseLife`,
  disparo doble, escalado del jefe, impactos, recompensa, precedencia de fin de
  partida, tabla ordenada, recorte a cinco, persistencia, corrupción y
  almacenamiento bloqueado. Las pruebas de tabla usan un almacenamiento falso y
  fechas fijas.
- **Rationale**: Cubre todos los FR sin depender del navegador y mantiene la
  rapidez del runner integrado. Los casos de persistencia se pueden simular sin
  `localStorage` real.
- **Alternatives considered**:
  - Pruebas end-to-end con navegador: valiosas, pero lentas y frágiles para
    reglas numéricas.
  - Pruebas manuales únicamente: no detectan regresiones de orden ni de límites.
- **Risks**: La interfaz y el render requieren la validación manual del
  quickstart; las pruebas unitarias no cubren píxeles ni eventos reales.
