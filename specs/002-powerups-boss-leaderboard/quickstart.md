# Quickstart: Power-ups, jefes y tabla de mejores puntajes

**Feature**: `specs/002-powerups-boss-leaderboard/spec.md`

## Requisitos

- Node.js 18 o superior (solo para pruebas; el juego no lo necesita).
- Chrome o Firefox estables en escritorio.
- Ningún servidor, instalación de paquetes ni conexión de red.

## Ejecutar el juego

1. Abrir `index.html` directamente en el navegador.
2. En la pantalla de inicio debe verse la tabla de puntajes (vacía la primera
   vez) y el botón "Empezar partida".
3. Jugar con flechas y `Espacio`.

## Pruebas automatizadas

Desde la raíz del repositorio:

```bash
node --test tests/unit/*.test.js
```

Cobertura esperada:

- `powerups.test.js`: drops con tirada forzada, caída, recogida, renovación,
  vida extra con tope, escudo y disparo doble.
- `boss.test.js`: oleadas de jefe, escalado, impactos, recompensa, drop y
  precedencia con el fin de partida.
- `leaderboard.test.js`: validación, orden, recorte a cinco, persistencia,
  corrupción y almacenamiento bloqueado.
- `collision.test.js`, `game-state.test.js`, `formation.test.js` y
  `sound.test.js`: regresiones del juego base.

Todas las pruebas deben pasar sin DOM ni navegador.

## Escenarios manuales

### 1. Power-ups

1. Iniciar una partida y destruir enemigos hasta ver caer un objeto.
2. Comprobar que los tres tipos son distinguibles: dos barras (disparo doble),
   anillo (escudo) y cruz (vida extra).
3. Recoger cada tipo:
   - Disparo doble: aparecen dos proyectiles por disparo y el HUD muestra
     `DISPARO x2` con la cuenta atrás.
   - Escudo: aparece un aura y los impactos no quitan vidas mientras dura.
   - Vida extra: el contador de vidas sube; con 5 vidas se suman 250 puntos.
4. Esperar a que termine cada efecto y comprobar que vuelve al comportamiento
   normal.
5. Dejar caer un power-up sin recogerlo y verificar que desaparece al cruzar el
   borde inferior.

### 2. Jefe

1. Completar las oleadas 1 y 2.
2. En la oleada 3 debe aparecer un jefe con barra de vida y sin formación
   normal.
3. Disparar al jefe y comprobar que la barra baja.
4. Recibir un impacto del jefe o de su proyectil: se pierde una vida salvo con
   escudo o invulnerabilidad.
5. Derrotar al jefe: se suman puntos, cae un power-up y comienza la oleada 4.
6. Llegar a la oleada 6: el segundo jefe debe tener más vida y disparar más a
   menudo.
7. Comprobar que el jefe no baja a la zona del jugador ni provoca daño por el
   borde inferior.

### 3. Tabla de puntajes

1. Terminar una partida con puntuación mayor que 0.
2. En la pantalla final debe aparecer la tabla con la entrada nueva destacada y
   el texto de nuevo top 5.
3. Reiniciar, terminar otra partida y comprobar el orden por puntos, oleada y
   fecha.
4. Recargar la página: la tabla debe conservarse.
5. Comprobar que una partida con 0 puntos no añade entrada.

### 4. Persistencia y degradación

Con la consola del navegador:

```js
// Ver la tabla guardada
localStorage.getItem('juegoia.space-invaders.leaderboard');

// Corromper la tabla y recargar: debe mostrarse vacía sin errores
localStorage.setItem('juegoia.space-invaders.leaderboard', 'no-es-json');

// Sembrar entradas para probar orden y recorte
localStorage.setItem('juegoia.space-invaders.leaderboard', JSON.stringify([
  { score: 100, wave: 2, date: '2026-11-01' },
  { score: 500, wave: 4, date: '2026-11-02' },
  { score: 500, wave: 6, date: '2026-11-03' },
  { score: 50,  wave: 1, date: '2026-11-04' },
  { score: 900, wave: 5, date: '2026-11-05' },
  { score: 10,  wave: 1, date: '2026-11-06' }
]));
```

Recargar y comprobar que solo quedan cinco entradas, ordenadas por puntuación,
luego oleada y luego fecha más antigua.

Para simular almacenamiento bloqueado durante la sesión:

```js
Storage.prototype.setItem = function () { throw new Error('bloqueado'); };
Storage.prototype.getItem = function () { throw new Error('bloqueado'); };
```

El juego debe seguir siendo jugable y la tabla debe funcionar en memoria hasta
recargar.

### 5. Rendimiento y consola

1. Abrir las herramientas de desarrollo y comprobar que no hay errores ni
   peticiones de red.
2. Usar el medidor de FPS con una oleada de jefe y varios power-ups en pantalla;
   debe mantenerse fluido a 60 FPS.
3. Comprobar que la barra de vida y los temporizadores se actualizan sin
   parpadeos ni saltos.

## Resultados esperados

- Los tres power-ups aparecen, se recogen y expiran según la especificación.
- Cada tercera oleada presenta un jefe con barra de vida, dificultad creciente y
  recompensa al caer.
- La tabla de cinco puntajes se ordena, se conserva y se degrada a memoria sin
  romper la partida.
- No hay errores de consola, peticiones de red ni regresiones en el juego base.

## Referencias

- Reglas y APIs: [gameplay-contract.md](./contracts/gameplay-contract.md)
- Formato y garantías de la tabla:
  [storage-contract.md](./contracts/storage-contract.md)
- Pantallas, HUD y tabla: [ui-contract.md](./contracts/ui-contract.md)
- Entidades y transiciones: [data-model.md](./data-model.md)
