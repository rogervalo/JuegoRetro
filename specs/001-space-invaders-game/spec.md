# Feature Specification: Juego Space Invaders Neon

**Feature Branch**: `001-space-invaders-game`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Crear un juego tipo Space Invaders donde el jugador controla una nave en la parte inferior con las flechas izquierda y derecha y dispara con la barra espaciadora. Debe tener 3 vidas, oleadas de enemigos que bajan poco a poco, puntuación en pantalla, récord guardado en el navegador, pantalla de inicio y botón de reinicio al perder."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Partida jugable con nave y disparos (Priority: P1)

El jugador inicia una partida, mueve su nave por la parte inferior del campo con
las flechas izquierda y derecha y dispara con la barra espaciadora. Los disparos
impactan en formaciones de enemigos que descienden gradualmente; cada enemigo
derrotado suma puntos que se muestran en pantalla. El jugador dispone de 3 vidas
y la partida termina cuando se agotan.

**Why this priority**: Es el valor central del producto; sin este bucle de juego
no existen las demás funciones.

**Independent Test**: Se puede validar abriendo el juego, moviendo la nave,
disparando a una formación y comprobando que los enemigos desaparecen, la
puntuación aumenta y las vidas se reducen al recibir impactos.

**Acceptance Scenarios**:

1. **Given** una partida en curso, **When** el jugador pulsa la flecha izquierda
   o derecha, **Then** la nave se desplaza en esa dirección sin salirse del área
   de juego.
2. **Given** una partida en curso, **When** el jugador pulsa la barra
   espaciadora, **Then** se lanza un proyectil hacia la formación de enemigos.
3. **Given** un proyectil alcanza a un enemigo, **When** se resuelve el impacto,
   **Then** el enemigo desaparece y la puntuación visible aumenta.
4. **Given** una nave con vidas disponibles, **When** un enemigo o su proyectil
   alcanza a la nave, **Then** se pierde una vida y la puntuación y las vidas
   visibles se actualizan.
5. **Given** la nave tiene 1 vida, **When** recibe un impacto, **Then** la
   partida finaliza y se muestra el estado de fin de juego.

---

### User Story 2 - Pantalla de inicio y récord persistente (Priority: P2)

Antes de jugar, el jugador ve una pantalla de inicio con la identidad visual del
juego y una acción clara para comenzar. Durante y después de la partida se
muestra el mejor resultado alcanzado, que se conserva en el navegador entre
recargas y sesiones.

**Why this priority**: Proporciona contexto de entrada y un objetivo de
superación sin el cual la puntuación carece de valor duradero.

**Independent Test**: Se puede validar abriendo el juego por primera vez,
iniciando una partida desde la pantalla de inicio, anotando el récord,
recargando y verificando que el récord sigue visible.

**Acceptance Scenarios**:

1. **Given** un jugador abre el juego, **When** se carga la pantalla inicial,
   **Then** ve el título del juego, una instrucción de inicio y un control para
   empezar a jugar.
2. **Given** la pantalla de inicio, **When** el jugador activa el control de
   inicio, **Then** comienza una partida nueva con 3 vidas y puntuación en cero.
3. **Given** una partida en la que se supera el récord anterior, **When** se
   alcanza la nueva puntuación, **Then** el récord visible se actualiza.
4. **Given** un récord guardado, **When** se recarga la página o se abre el
   juego de nuevo, **Then** el récord se muestra con el mismo valor.
5. **Given** el navegador impide guardar datos, **When** termina una partida,
   **Then** el juego sigue funcionando y el récord se mantiene solo durante la
   sesión actual.

---

### User Story 3 - Oleadas progresivas y reinicio (Priority: P3)

Los enemigos aparecen en formaciones que descienden poco a poco y, al eliminar
una formación, comienza una nueva oleada ligeramente más exigente. Al perder la
última vida, el jugador ve el resultado final y un botón que reinicia la
partida desde cero sin recargar la página.

**Why this priority**: Aporta progresión y cierre de la experiencia; depende del
bucle de juego pero se prueba de forma aislada observando el cambio de oleada y
el botón de reinicio.

**Independent Test**: Se puede validar eliminando una formación completa y
confirmando que aparece otra, y forzando el fin de juego para comprobar que el
botón de reinicio devuelve el estado inicial.

**Acceptance Scenarios**:

1. **Given** una oleada activa, **When** los enemigos siguen avanzando sin ser
   eliminados, **Then** la formación desciende de forma gradual hacia la nave.
2. **Given** todos los enemigos de una oleada eliminados, **When** se inicia la
   siguiente oleada, **Then** aparece una formación nueva y el número de oleada
   visible aumenta.
3. **Given** una nueva oleada, **When** comienza, **Then** el descenso de los
   enemigos es igual o más rápido que en la oleada anterior.
4. **Given** una partida terminada, **When** se muestra el botón de reinicio,
   **Then** el jugador puede pulsarlo y vuelve a una partida con 3 vidas,
   puntuación en cero y primera oleada.
5. **Given** una partida terminada, **When** se reinicia, **Then** el récord
   guardado se conserva.

---

### Edge Cases

- La nave llega al borde lateral: se detiene en el límite sin desaparecer ni
  envolverse al lado opuesto.
- El jugador mantiene pulsada la barra espaciadora: no se generan disparos de
  forma ilimitada; solo puede haber un proyectil activo del jugador a la vez.
- Un enemigo alcanza la zona inferior sin ser eliminado: se pierde una vida y
  la oleada vuelve a su formación inicial.
- Dos impactos ocurren casi simultáneamente: se contabiliza como una sola
  pérdida de vida por breve periodo de protección tras el impacto.
- El récord supera la capacidad de visualización o el almacenamiento está
  corrupto: el juego muestra un valor válido y continúa sin interrumpirse.
- El jugador recarga la página durante una partida: vuelve a la pantalla de
  inicio y el récord se mantiene.
- Se pulsa reinicio varias veces seguidas: solo se crea una partida nueva y no
  se duplican enemigos, vidas ni puntuación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El juego MUST mostrar una pantalla de inicio con el título, una
  instrucción de inicio y un control para empezar a jugar.
- **FR-002**: El juego MUST permitir mover la nave hacia la izquierda y la
  derecha con las flechas correspondientes dentro de los límites del campo.
- **FR-003**: El juego MUST permitir disparar con la barra espaciadora y MUST
  limitar a un proyectil activo del jugador a la vez.
- **FR-004**: El juego MUST mostrar formaciones de enemigos que descienden
  gradualmente hacia la nave.
- **FR-005**: El juego MUST eliminar al enemigo alcanzado por un proyectil del
  jugador y MUST sumar puntos por cada eliminación.
- **FR-006**: El juego MUST mostrar la puntuación actual en pantalla durante
  toda la partida.
- **FR-007**: El juego MUST otorgar 3 vidas al inicio de cada partida y MUST
  mostrar las vidas restantes en pantalla.
- **FR-008**: El juego MUST reducir una vida cuando la nave sea alcanzada por
  un enemigo o un proyectil enemigo.
- **FR-009**: El juego MUST reducir una vida cuando un enemigo llegue a la zona
  inferior del campo.
- **FR-010**: El juego MUST iniciar una nueva oleada al eliminar todos los
  enemigos de la oleada anterior, con un descenso igual o mayor.
- **FR-011**: El juego MUST mostrar el número de oleada en pantalla.
- **FR-012**: El juego MUST finalizar la partida al agotar las vidas y MUST
  mostrar la puntuación final junto a un botón de reinicio.
- **FR-013**: El botón de reinicio MUST iniciar una partida nueva con 3 vidas,
  puntuación en cero y primera oleada, sin recargar la página.
- **FR-014**: El juego MUST mostrar el récord y MUST actualizarlo cuando la
  puntuación actual lo supere.
- **FR-015**: El juego MUST conservar el récord en el navegador entre recargas
  y sesiones, y MUST seguir funcionando si el almacenamiento no está
  disponible.
- **FR-016**: El juego MUST aplicar una identidad visual retro neón coherente
  a todos los elementos visibles.
- **FR-017**: El juego MUST mantener una animación fluida y continua durante la
  partida en equipos de referencia.

### Key Entities *(include if feature involves data)*

- **Nave del jugador**: Representa al jugador dentro del campo; posición
  horizontal limitada y vidas restantes.
- **Enemigo**: Miembro de una formación; posición, estado (activo o eliminado) y
  puntos que aporta al ser derrotado.
- **Proyectil**: Objeto en movimiento con origen (jugador o enemigo) y
  dirección vertical.
- **Oleada**: Formación activa; número de orden, cantidad de enemigos y
  velocidad de descenso.
- **Partida**: Estado de una sesión de juego; puntuación, vidas, oleada actual
  y fase (inicio, en curso o terminada).
- **Récord**: Mejor puntuación alcanzada, conservada entre sesiones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los usuarios de prueba inicia una partida desde la
  pantalla de inicio sin ayuda adicional en menos de 5 segundos.
- **SC-002**: El 95 % de los usuarios de prueba mueve la nave y dispara
  correctamente en su primer intento sin instrucciones adicionales.
- **SC-003**: En el 100 % de las pruebas, el récord permanece visible tras
  recargar la página y volver a abrir el juego.
- **SC-004**: El 100 % de los usuarios de prueba reinicia una partida terminada
  con una sola activación del botón de reinicio.
- **SC-005**: En sesiones de 10 minutos, el 95 % de los usuarios no percibe
  interrupciones ni saltos visibles en la animación.
- **SC-006**: El 100 % de los usuarios de prueba completa al menos una oleada y
  observa el inicio de la siguiente sin errores visibles.
- **SC-007**: El 100 % de los usuarios identifica el número de vidas, la
  puntuación y el récord en pantalla sin que se le indique dónde están.

## Assumptions

- El juego se dirige a un único jugador en un dispositivo de escritorio con
  teclado; el control táctil y móvil queda fuera del alcance de esta versión.
- El campo de juego es de una sola pantalla y no incluye desplazamiento ni
  niveles con geométricas especiales.
- La colisión con un enemigo, un proyectil enemigo o un enemigo que llega al
  fondo cuesta una vida; tras perder una vida, la oleada reinicia su formación.
- Solo puede existir un proyectil del jugador a la vez y se aplica una breve
  protección tras recibir un impacto para evitar pérdidas dobles.
- Cada nueva oleada aumenta la dificultad exclusivamente mediante un descenso
  igual o más rápido de los enemigos.
- El récord se guarda de forma local en el navegador; no existe clasificación
  en línea ni sincronización entre dispositivos.
- No se requiere audio, mundos múltiples ni perfiles de usuario en esta versión.
- La apariencia retro neón sigue la paleta y los efectos definidos por la
  constitución del proyecto.
