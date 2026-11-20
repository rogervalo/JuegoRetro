# Feature Specification: Power-ups, jefes y tabla de mejores puntajes

**Feature Branch**: `002-powerups-boss-leaderboard`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Agregar un sistema de power-ups que caen al destruir enemigos (disparo doble, escudo temporal y vida extra), un jefe final cada 3 oleadas con barra de vida, y una tabla con los 5 mejores puntajes guardados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Power-ups al destruir enemigos (Priority: P1)

Al destruir enemigos, algunos sueltan objetos que caen por el campo. Si la nave
los toca, el jugador obtiene una mejora temporal o permanente: disparo doble,
escudo temporal o una vida extra. El jugador ve qué efecto está activo y cuánto
le queda.

**Why this priority**: Aporta la recompensa inmediata y la variedad de juego que
justifica el resto de la ampliación.

**Independent Test**: Se puede validar destruyendo enemigos hasta que caiga un
power-up, recogiéndolo y comprobando que el efecto descrito ocurre y que el
indicador visible aparece.

**Acceptance Scenarios**:

1. **Given** una partida en curso, **When** se destruye un enemigo, **Then**
   puede aparecer un power-up que desciende por el campo.
2. **Given** un power-up de disparo doble en el campo, **When** la nave lo toca,
   **Then** cada disparo lanza dos proyectiles durante el tiempo indicado y
   luego vuelve a un solo proyectil.
3. **Given** un power-up de escudo en el campo, **When** la nave lo toca,
   **Then** la nave queda protegida durante el tiempo indicado y los impactos
   no cuestan vidas mientras el escudo esté activo.
4. **Given** un power-up de vida extra en el campo, **When** la nave lo toca,
   **Then** se suma una vida hasta el máximo permitido y el HUD lo refleja.
5. **Given** un power-up que cae sin ser recogido, **When** sale por el borde
   inferior, **Then** desaparece sin afectar la partida.
6. **Given** un efecto activo, **When** se recoge otro power-up del mismo tipo,
   **Then** su duración se renueva al valor completo.

---

### User Story 2 - Jefe final cada 3 oleadas (Priority: P2)

Cada tres oleadas, en lugar de una formación normal aparece un jefe con una
barra de vida visible. El jefe se mueve y ataca; cada impacto del jugador reduce
su barra. Al derrotarlo, el jugador recibe una bonificación y comienza la
siguiente oleada.

**Why this priority**: Introduce un objetivo culminante y una curva de dificultad
que renueva la experiencia de las oleadas.

**Independent Test**: Se puede validar alcanzando la oleada 3, comprobando la
aparición del jefe y su barra, reduciendo su vida con disparos y verificando la
bonificación al derrotarlo.

**Acceptance Scenarios**:

1. **Given** el jugador completa la oleada 2, **When** comienza la oleada 3,
   **Then** aparece un jefe con la barra de vida completa en lugar de la
   formación habitual.
2. **Given** un jefe activo, **When** un proyectil del jugador lo alcanza,
   **Then** la barra de vida disminuye de forma visible.
3. **Given** un jefe con poca vida, **When** recibe el impacto final, **Then**
   es derrotado, se suman puntos de bonificación y comienza la siguiente
   oleada.
4. **Given** un jefe activo, **When** el jefe o sus proyectiles alcanzan la nave,
   **Then** se pierde una vida salvo que el escudo o la invulnerabilidad estén
   activos.
5. **Given** el segundo jefe de la partida, **When** aparece, **Then** tiene más
   vida y ataca con mayor frecuencia que el primero.
6. **Given** un jefe derrotado, **When** termina la oleada, **Then** deja caer
   un power-up.

---

### User Story 3 - Tabla de los 5 mejores puntajes (Priority: P3)

Al terminar cada partida, la puntuación entra en una tabla con los cinco mejores
resultados, que se conserva en el navegador. La tabla se muestra en la pantalla
inicial y en la pantalla final, e indica la posición del nuevo resultado.

**Why this priority**: Da continuidad y un objetivo de superación a largo plazo
sin alterar el bucle principal de juego.

**Independent Test**: Se puede validar jugando varias partidas, comprobando que
la tabla se ordena, conserva cinco entradas y sobrevive a una recarga.

**Acceptance Scenarios**:

1. **Given** una partida terminada con puntuación mayor que cero, **When** se
   muestra el resultado final, **Then** la puntuación aparece en la tabla si
   está entre las cinco mejores.
2. **Given** una tabla con menos de cinco entradas, **When** termina otra
   partida, **Then** la nueva entrada se añade y la tabla queda ordenada de
   mayor a menor.
3. **Given** una tabla con cinco entradas, **When** una nueva puntuación supera
   a la última, **Then** la entrada más baja sale y la nueva ocupa su lugar.
4. **Given** una tabla guardada, **When** se recarga la página o se vuelve a
   abrir el juego, **Then** la tabla se muestra con los mismos valores.
5. **Given** una tabla guardada, **When** se alcanza una nueva posición,
   **Then** la entrada nueva se destaca visualmente en la pantalla final.
6. **Given** un navegador que impide guardar datos, **When** termina una
   partida, **Then** el juego sigue funcionando y la tabla se mantiene solo
   durante la sesión actual.

---

### Edge Cases

- La nave recoge un power-up justo cuando el escudo o la invulnerabilidad están
  a punto de terminar: el efecto se renueva sin acumularse indefinidamente.
- El jugador ya tiene el máximo de vidas y recoge una vida extra: recibe una
  bonificación de puntos en lugar de una vida.
- Dos power-ups caen al mismo tiempo: ambos pueden recogerse y sus efectos
  distintos coexisten.
- Un power-up cae durante la oleada de un jefe: se puede recoger igual que en
  una oleada normal.
- El jefe es derrotado en el mismo instante en que el jugador pierde su última
  vida: prevalece el fin de partida y no se otorga la bonificación del jefe.
- La tabla contiene puntuaciones empatadas: se ordenan primero por puntuación,
  luego por oleada alcanzada y después por fecha de consecución más antigua.
- La tabla guardada está corrupta o incompleta: se descartan las entradas
  inválidas y se muestra una tabla válida.
- Una partida termina con puntuación cero: no se añade a la tabla.
- Se recoge un power-up de disparo doble cuando ya está activo: la duración se
  renueva y no se duplican los proyectiles más allá de dos por disparo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El juego MUST permitir que los enemigos destruidos suelten
  power-ups que descienden por el campo.
- **FR-002**: El juego MUST recoger un power-up cuando la nave lo toca y MUST
  hacerlo desaparecer si cruza el borde inferior sin recogerse.
- **FR-003**: El juego MUST ofrecer tres tipos de power-up: disparo doble,
  escudo temporal y vida extra.
- **FR-004**: El disparo doble MUST lanzar dos proyectiles por disparo durante
  su duración y MUST volver a un solo proyectil al terminar.
- **FR-005**: El escudo temporal MUST evitar la pérdida de vidas por impactos
  mientras esté activo y MUST mostrar un indicador visual en la nave.
- **FR-006**: La vida extra MUST sumar una vida hasta el máximo permitido y MUST
  otorgar una bonificación de puntos si ya se alcanzó ese máximo.
- **FR-007**: Recoger un power-up del mismo tipo que un efecto activo MUST
  renovar su duración al valor completo.
- **FR-008**: El HUD MUST mostrar los efectos activos y el tiempo restante de
  cada uno.
- **FR-009**: El juego MUST reemplazar la formación habitual por un jefe en
  cada tercera oleada, empezando por la oleada 3.
- **FR-010**: El jefe MUST mostrar una barra de vida con su estado actual y
  máximo.
- **FR-011**: Los proyectiles del jugador MUST reducir la vida del jefe y MUST
  derrotarlo al llegar a cero.
- **FR-012**: El jefe MUST desplazarse y disparar proyectiles a intervalos.
- **FR-013**: Los proyectiles y el contacto del jefe MUST costar una vida, salvo
  que el escudo o la invulnerabilidad estén activos.
- **FR-014**: Cada nuevo jefe MUST tener más vida y atacar con mayor frecuencia
  que el anterior.
- **FR-015**: Derrotar al jefe MUST otorgar una bonificación de puntos, iniciar
  la siguiente oleada y dejar caer un power-up.
- **FR-016**: El jefe MUST permanecer en la zona superior del campo y MUST NOT
  provocar una pérdida de vida por llegar al borde inferior.
- **FR-017**: El juego MUST conservar una tabla con los cinco mejores puntajes
  en el navegador.
- **FR-018**: Cada partida terminada con puntuación mayor que cero MUST ser
  candidata a entrar en la tabla.
- **FR-019**: Cada entrada de la tabla MUST mostrar puntuación, oleada alcanzada
  y fecha de consecución.
- **FR-020**: La tabla MUST ordenarse de mayor a menor puntuación; en caso de
  empate, por oleada alcanzada y luego por fecha más antigua.
- **FR-021**: La tabla MUST mostrarse en la pantalla inicial y en la pantalla
  final, y MUST destacar la entrada nueva cuando corresponda.
- **FR-022**: La tabla MUST conservarse entre recargas y sesiones, y el juego
  MUST seguir funcionando si el almacenamiento no está disponible.
- **FR-023**: La tabla de cinco puntajes MUST sustituir a la visualización del
  récord único; la primera posición actúa como récord.
- **FR-024**: Al iniciar una partida nueva se MUST reiniciar los power-ups y
  efectos activos, y MUST conservarse la tabla de puntajes.

### Key Entities *(include if feature involves data)*

- **Power-up**: Objeto que cae por el campo; tipo (disparo doble, escudo o vida
  extra), posición y estado (activo o recogido/descartado).
- **Efecto activo**: Mejora en curso sobre la nave; tipo y tiempo restante.
- **Jefe**: Enemigo especial de una oleada; vida actual, vida máxima, posición,
  cadencia de ataque y número de oleada.
- **Entrada de tabla**: Resultado de una partida; puntuación, oleada alcanzada,
  fecha y marca de resultado nuevo.
- **Tabla de puntajes**: Hasta cinco entradas ordenadas, conservadas entre
  sesiones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los jugadores de prueba identifica visualmente cuándo
  un power-up está cayendo y cuándo lo ha recogido.
- **SC-002**: El 95 % de los jugadores de prueba observa el efecto del disparo
  doble y del escudo sin instrucciones adicionales.
- **SC-003**: En el 100 % de las partidas de prueba, la oleada 3 presenta un
  jefe con barra de vida visible.
- **SC-004**: La barra de vida del jefe refleja cada impacto en menos de 200 ms.
- **SC-005**: El 100 % de los jugadores de prueba distingue al jefe de un
  enemigo normal y reconoce cuándo ha sido derrotado.
- **SC-006**: En el 100 % de las pruebas, la tabla conserva sus cinco entradas
  tras recargar la página.
- **SC-007**: En el 100 % de las pruebas, la tabla aparece ordenada de mayor a
  menor puntuación.
- **SC-008**: El 100 % de las partidas que califican añaden su entrada y la
  destacan en la pantalla final.
- **SC-009**: El 95 % de los jugadores de prueba completa una partida con
  power-ups y jefe sin percibir interrupciones en la animación.
- **SC-010**: Con el almacenamiento bloqueado, el 100 % de las partidas sigue
  siendo jugable y la tabla funciona durante la sesión.

## Assumptions

- La probabilidad de que un enemigo normal suelte un power-up es del 15 %; los
  tres tipos tienen la misma probabilidad y el jefe siempre deja uno al caer.
- El disparo doble dura 10 segundos y el escudo 8 segundos; recoger el mismo
  tipo renueva la duración completa sin acumular más de dos proyectiles.
- La vida extra suma una vida con un máximo de 5; al alcanzar el máximo otorga
  250 puntos de bonificación.
- Los jefes aparecen en las oleadas 3, 6, 9 y sucesivas; su vida base es 40 y
  aumenta 20 por cada nuevo jefe, con una bonificación de 500 puntos más 250 por
  jefe adicional.
- El jefe permanece en la mitad superior del campo y no desciende a la zona del
  jugador; su dificultad aumenta por vida y cadencia de disparo.
- Si el jugador pierde su última vida en el mismo instante en que el jefe es
  derrotado, prevalece el fin de partida.
- La tabla sustituye al récord único, guarda solo puntuaciones mayores que cero
  y no incluye nombres de jugador; la fecha se registra localmente.
- La tabla se guarda en el navegador; no existe clasificación en línea ni
  sincronización entre dispositivos.
- El alcance sigue siendo de un jugador en escritorio con teclado; no se añaden
  controles táctiles ni modos multijugador.
- Los efectos de sonido existentes se reutilizan para los nuevos eventos cuando
  corresponda, sin archivos de audio externos.
