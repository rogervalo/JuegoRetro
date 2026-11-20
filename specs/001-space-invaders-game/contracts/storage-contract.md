# Storage Contract: Récord del juego

**Feature**: `specs/001-space-invaders-game/spec.md`

## Clave y formato

| Propiedad | Valor |
|-----------|-------|
| Clave | `juegoia.space-invaders.best` |
| Tipo de valor | Cadena que representa un entero decimal |
| Rango válido | `0` a `999999` |
| Ausencia de clave | Equivale a récord 0 |

## Operaciones

### Lectura

1. Solicitar el valor de la clave al almacenamiento local del navegador.
2. Si la operación lanza un error, devolver `{ value: 0, storageAvailable: false }`.
3. Si no hay valor, devolver `{ value: 0, storageAvailable: true }`.
4. Convertir el valor a entero; aceptarlo solo si es finito y está en el rango.
5. Si el valor no es válido, devolver 0 sin borrar la clave.

### Escritura

1. Comprobar que el nuevo valor es un entero dentro del rango; si no, ignorar.
2. Escribir solo si el nuevo valor es mayor que el récord actual.
3. Si la escritura lanza un error, conservar el valor en memoria para la sesión
   y marcar `storageAvailable = false`.
4. La escritura fallida nunca interrumpe la partida ni muestra un error.

## Garantías

- El récord visible nunca disminuye durante una sesión.
- El récord sobrevive a recargas y a abrir de nuevo el juego cuando el
  almacenamiento está disponible.
- Si el almacenamiento está bloqueado o corrupto, el juego sigue siendo
  totalmente jugable y el récord se mantiene solo en memoria.
- No se envían datos a ningún servicio externo.

## Criterios de aceptación

1. Tras superar el récord y recargar, el nuevo valor sigue visible.
2. Con almacenamiento bloqueado, iniciar y terminar una partida no produce
   errores visibles.
3. Con un valor corrupto en la clave, el juego muestra 0 y continúa.
