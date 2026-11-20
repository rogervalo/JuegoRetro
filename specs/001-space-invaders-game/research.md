# Research: Juego Space Invaders Neon

**Feature**: `specs/001-space-invaders-game/spec.md`
**Date**: 2026-11-19

## R1 — Ejecución directa desde disco y formato de módulos

- **Decision**: Usar scripts clásicos (`<script src>`) cargados en orden, cada uno
  con un envoltorio IIFE que registra su API en `globalThis.JuegoIA` y expone la
  lógica pura mediante un guardián `module.exports` para Node. No se usa
  `type="module"` en el navegador.
- **Rationale**: Las peticiones de módulos ES usan CORS y `file://` nunca es
  mismo origen, por lo que Chrome y Firefox bloquean los módulos al abrir
  `index.html` directamente. Los scripts clásicos sí funcionan desde disco y
  permiten mantener la regla no negociable de "abrir y jugar sin servidor"; el
  guardián de exportación permite ejecutar pruebas deterministas con Node sin
  DOM.
- **Alternatives considered**:
  - Módulos ES + servidor estático: más limpio, pero exige servidor y rompe el
    principio I y la restricción de entrada del proyecto.
  - Todo el juego en un único script en línea: funciona desde disco, pero
    sacrifica la modularidad y dificulta las pruebas sin DOM.
  - Banderas del navegador, data URLs, bundlers o CDN: frágiles, dependen del
    usuario o violan cero dependencias y funcionamiento offline.
- **Risks**: Requiere disciplina en el orden de carga de los scripts y una
  excepción documentada a la línea "ECMAScript modules" de la constitución. El
  envoltorio añade algo de repetición. Esta decisión se registra en
  `plan.md` → *Complexity Tracking*.

## R2 — Bucle de simulación y fluidez

- **Decision**: `requestAnimationFrame` con paso fijo de 1/60 s y acumulador.
  El tiempo transcurrido se limita a 0,25 s y se permiten como máximo 5 pasos de
  recuperación por fotograma. El renderizado interpola entre estados anterior y
  actual con `alpha = acumulador / paso`.
- **Rationale**: El paso fijo hace que movimiento y colisiones sean
  deterministas; el límite evita el espiral de ejecución al volver de una pestaña en
  segundo plano; la interpolación elimina tirones en pantallas de alta tasa de
  refresco.
- **Alternatives considered**: Delta variable (deriva y colisiones
  inconsistentes), `setInterval` (limitación en segundo plano), renderizar sin
  interpolación (salto visible a 120 Hz).
- **Risks**: Un límite demasiado bajo produce ralentización bajo carga; hay que
  reiniciar el estado interpolado tras cada reinicio de partida.

## R3 — Colisiones y control de disparo

- **Decision**: Colisión AABB por comparación de intervalos con coordenadas
  enteras. El proyectil del jugador se desactiva en el primer impacto. Solo
  puede existir un proyectil del jugador a la vez; se permite de nuevo al salir
  del campo o al impactar.
- **Rationale**: Es suficiente para sprites rectangulares, económico y evita
  sobrecostes de detección más costosa. La regla de un disparo coincide con la
  especificación y evita spam.
- **Alternatives considered**: Colisión circular (peor ajuste a la forma de los
  invasores), permitir disparos múltiples (cambia el equilibrio previsto).
- **Risks**: Proyectiles muy rápidos podrían atravesar objetivos; la velocidad
  se mantiene moderada y el paso fijo limita el desplazamiento por fotograma.

## R4 — Oleadas, descenso y vidas

- **Decision**: Formación de 5 filas × 10 columnas que barre lateralmente,
  invierte la dirección y baja un escalón al llegar a un borde. La velocidad
  crece ~10 % por oleada con un techo. Al perder una vida se limpian los
  proyectiles y la formación vuelve a su posición inicial de la oleada actual,
  conservando puntos y número de oleada.
- **Rationale**: Reproduce el ritmo clásico y hace cada oleada igual o más
  exigente sin cambiar las reglas. Reiniciar la formación evita situaciones
  injustas tras un impacto.
- **Alternatives considered**: Aumentar solo la velocidad de las balas (no
  precede a la formación), mantener la formación dañada tras el impacto
  (desequilibrio).
- **Risks**: El crecimiento sin techo haría el juego injugable; se aplica un
  límite máximo.

## R5 — Invulnerabilidad tras impacto

- **Decision**: 1,5 s de invulnerabilidad con parpadeo visual tras recibir un
  impacto, contados en tiempo de simulación.
- **Rationale**: Da margen para recuperarse y evita que dos impactos casi
  simultáneos cuesten dos vidas, tal como exige la especificación.
- **Alternatives considered**: 0,5 s (insuficiente), 3 s (trivializa el
  peligro), sin invulnerabilidad (contradice el caso límite).
- **Risks**: El parpadeo no debe ocultar la nave por completo durante periodos
  largos; se usa un patrón de visibilidad intermitente.

## R6 — Persistencia del récord

- **Decision**: Guardar un entero no negativo en almacenamiento local del
  navegador bajo una clave única, con lectura validada y `try/catch`. Si la
  lectura, el análisis o la escritura fallan, se mantiene un valor en memoria
  durante la sesión y el juego continúa.
- **Rationale**: Cumple la persistencia entre recargas sin interrumpir la
  partida en modo privado o con datos corruptos.
- **Alternatives considered**: Almacenamiento en cookies (más peso), clasificación
  remota (fuera de alcance y rompe offline).
- **Risks**: El valor almacenado puede no ser numérico o ser excesivo; se
  normaliza a 0 o al máximo representable.

## R7 — Estética retro neón y rendimiento

- **Decision**: Fondo casi negro, paleta neón fija, resplandor mediante
  degradados y `shadowBlur`, y superposición de líneas de barrido. Cada sprite
  con resplandor se pre-renderiza en un lienzo fuera de pantalla y se dibuja con
  `drawImage`; la superposición se cachea como patrón.
- **Rationale**: `shadowBlur` es costoso por llamada de dibujo; moverlo a la
  preparación de sprites mantiene el presupuesto de 16,67 ms por fotograma y
  conserva una estética coherente.
- **Alternatives considered**: Filtros CSS sobre el lienzo (coste de
  composición), degradados y sombras recalculados cada fotograma (caída de
  FPS), sprites externos (rompe autocontención).
- **Risks**: Escala de dispositivo y opacidad del barrido deben ajustarse para
  evitar desenfoque o patrón de moiré; se limita la escala efectiva.

## R8 — Entrada de teclado

- **Decision**: Escuchar `keydown`/`keyup` para ArrowLeft, ArrowRight y Space,
  con `preventDefault` en Space para evitar desplazamiento de la página. El
  estado de teclas pulsadas se guarda en un único módulo de entrada y se limpia
  en `blur` y `visibilitychange`.
- **Rationale**: Evita movimiento "pegado" al perder el foco y mantiene una
  sola fuente de verdad para los controles.
- **Alternatives considered**: Consultar el estado directamente en cada entidad
  (duplicación), sondear periódicamente (latencia).
- **Risks**: El botón de inicio y reinicio debe recibir el foco sin que Space
  active dos acciones; se normaliza el manejo de eventos en un solo lugar.
