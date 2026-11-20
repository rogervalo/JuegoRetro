# UI Contract: Pantallas, HUD y tabla

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`

## Pantalla de inicio

- Muestra el título, la ayuda de controles, la tabla de cinco puntajes y el
  botón "Empezar partida".
- La tabla tiene las columnas: `#`, `PUNTOS`, `OLEADA`, `FECHA`.
- Si no hay entradas, muestra una fila con `colspan="4"` y el texto
  "Aún no hay puntuaciones".
- No muestra una línea separada de récord: la primera fila de la tabla es el
  récord.

## Pantalla de fin de partida

- Muestra "FIN DE LA PARTIDA", la puntuación final, la tabla actualizada y el
  botón "Reiniciar".
- La fila de la entrada nueva lleva la clase `score-row--new` y un texto
  adicional "¡Nuevo top 5!" si `highlightIndex >= 0`.
- Si la puntuación no calificó, no se destaca ninguna fila y el texto indica que
  no entró en el top 5.
- La tabla y el botón deben caber en el campo de 960 × 600 sin scroll.

## HUD durante la partida

- Conserva `PUNTOS`, `VIDAS`, `OLEADA` y `RÉCORD` (derivado de la primera
  entrada de la tabla).
- Muestra los efectos activos con etiqueta y segundos restantes:
  - `DISPARO x2` mientras `effects.doubleShot > 0`.
  - `ESCUDO` mientras `effects.shield > 0`.
- Los indicadores usan los colores del tema y no dependen solo del color: cada
  uno lleva texto.
- En oleada de jefe se muestra una barra de vida centrada bajo el HUD con la
  etiqueta `JEFE` y el estado `actual / máximo`.

## Entidades visuales

| Elemento | Representación | Color principal |
|----------|----------------|-----------------|
| Disparo doble | Dos barras verticales paralelas | Lima |
| Escudo | Anillo/diamante | Cian |
| Vida extra | Cruz | Magenta |
| Jefe | Nave grande con núcleo y ojos | Magenta con núcleo cian |
| Barra de vida | Fondo oscuro y relleno luminoso | Lima/cian |
| Aura de escudo | Elipse pulsante alrededor de la nave | Cian |

- Los power-ups caen y se interpolan entre pasos.
- El jefe se interpola horizontalmente y permanece en la mitad superior.
- El aura de escudo se dibuja solo con el efecto activo; el parpadeo de
  invulnerabilidad se conserva.

## Accesibilidad y DOM

- La tabla usa `<caption>` oculto, `<thead>` con `scope="col"` y `<tbody>` con
  identificadores `start-scores` y `final-scores`.
- Las filas se crean con `createElement` y `textContent`; no se interpola HTML.
- El texto de la tabla es seleccionable y legible sin depender del Canvas.
- Los botones conservan el foco visible y el estilo neón existente.
- La información de la fila nueva no depende solo del color: incluye texto.

## Comportamiento

1. Al cargar la página se muestra la pantalla de inicio con la tabla cargada.
2. Al pulsar "Empezar partida" se ocultan ambas pantallas y comienza la partida.
3. Al terminar, se muestra la pantalla final con la tabla y la fila nueva
   destacada si corresponde.
4. Al pulsar "Reiniciar" se vuelve a jugar conservando la tabla.
5. Una recarga de página vuelve a la pantalla de inicio con la tabla persistida
   o la copia en memoria.

## Criterios de aceptación

1. La tabla de inicio y la final muestran como máximo cinco filas ordenadas.
2. La tabla vacía muestra el mensaje correspondiente.
3. La fila nueva se distingue visualmente y con texto.
4. La barra de vida del jefe refleja cada impacto en el siguiente fotograma.
5. Los indicadores de efectos desaparecen al llegar a 0.
6. La pantalla final no tapa el botón de reinicio ni desborda el campo.
