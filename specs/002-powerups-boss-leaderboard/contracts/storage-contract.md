# Storage Contract: Tabla de mejores puntajes

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`

## Clave y formato

| Propiedad | Valor |
|-----------|-------|
| Clave | `juegoia.space-invaders.leaderboard` |
| Tipo de valor | Cadena JSON con un arreglo de entradas |
| Entradas máximas | 5 |
| Ausencia de clave | Tabla vacía |
| Clave antigua | `juegoia.space-invaders.best` deja de leerse; no se migra ni se borra |

### Esquema

```json
[
  { "score": 1250, "wave": 7, "date": "2026-11-19" },
  { "score": 980, "wave": 5, "date": "2026-11-18" }
]
```

| Campo | Tipo | Validación |
|-------|------|------------|
| `score` | entero | > 0 y ≤ `maxRecord` (999999) |
| `wave` | entero | ≥ 1 y ≤ `maxWave` (9999) |
| `date` | cadena | Formato local `YYYY-MM-DD`; fecha real válida |

## Operaciones

### Lectura (`load`)

1. Si no hay almacenamiento, devolver `{ entries: memoria, storageAvailable: false }`.
2. Leer la clave; si lanza un error, marcar el almacenamiento como no
   disponible, conservar la memoria y devolverla.
3. Si no hay valor, devolver tabla vacía con `storageAvailable: true`.
4. Parsear el JSON; si falla, tratar como tabla vacía sin lanzar excepción.
5. Si el valor no es un arreglo, tratarlo como tabla vacía.
6. Validar cada entrada; descartar las inválidas sin borrar el resto.
7. Ordenar y recortar a `leaderboardSize`; guardar el resultado en memoria.
8. Devolver las entradas y el estado del almacenamiento.

### Escritura (`add`)

1. Validar la entrada candidata con las mismas reglas; si es inválida,
   devolver la tabla actual con `highlightIndex: -1`.
2. Unir la candidata a la tabla en memoria, ordenar y recortar a cinco.
3. Calcular `highlightIndex` por identidad de la entrada candidata; será -1 si
   quedó fuera.
4. Si la candidata entró, intentar escribir el arreglo completo como JSON.
5. Si la escritura falla, conservar la tabla en memoria y marcar
   `storageAvailable: false`.
6. Devolver `{ entries, highlightIndex, entry, storageAvailable }`.

### Orden

1. `score` descendente.
2. Si empatan, `wave` descendente.
3. Si siguen empatando, `date` ascendente (la fecha más antigua primero).
4. Si todo empata, se conserva el orden de inserción.

### Fecha

`today(date?)` devuelve la fecha local en formato `YYYY-MM-DD`, con ceros a la
izquierda. Se inyecta una fecha fija en las pruebas; el borde usa la fecha
actual.

## Garantías

- La tabla nunca contiene más de cinco entradas.
- Las entradas inválidas o corruptas se descartan sin interrumpir el juego.
- Una puntuación de 0 no entra en la tabla.
- La tabla sobrevive a recargas cuando el almacenamiento está disponible.
- Si el almacenamiento está bloqueado, la tabla funciona en memoria durante la
  sesión y el juego sigue siendo jugable.
- No se envían datos a ningún servicio externo.
- La tabla es la única fuente de puntuaciones; la primera entrada se usa como
  récord visible.

## Criterios de aceptación

1. Tras una partida con puntuación válida, la entrada aparece en la tabla y
   recargar conserva el orden.
2. Con cinco entradas, una puntuación mejor desplaza a la última; una peor no
   entra.
3. Un JSON corrupto, un valor que no es arreglo o entradas con campos inválidos
   producen una tabla vacía o filtrada sin errores.
4. Con `getItem`/`setItem` que lanzan errores, `add` actualiza la memoria y
   devuelve `storageAvailable: false`.
5. La entrada nueva se identifica con `highlightIndex` correcto; si no calificó,
   vale -1.
6. Dos puntuaciones iguales se ordenan por oleada y luego por fecha más antigua.
