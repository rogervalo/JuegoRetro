# UI Contract: Juego Space Invaders Neon

**Feature**: `specs/001-space-invaders-game/spec.md`

Este contrato describe la interfaz observable por el jugador. Es la frontera
entre la lógica del juego y la presentación; cualquier implementación debe
respetarlo.

## Pantallas (fases)

| Fase | Contenido obligatorio | Acción disponible |
|------|-----------------------|-------------------|
| `start` | Título, instrucción de inicio, récord, vista previa del campo | Iniciar partida |
| `playing` | Campo de juego, nave, formación, proyectiles, HUD | Mover y disparar |
| `gameover` | Puntuación final, récord, botón de reinicio | Reiniciar partida |

La transición a `gameover` ocurre al agotar las vidas. El reinicio no recarga
la página y conserva el récord. Recargar la página devuelve a `start`.

## Controles

| Entrada | Acción | Detalle observable |
|---------|--------|--------------------|
| ArrowLeft | Mover nave a la izquierda | La nave se detiene en el borde izquierdo |
| ArrowRight | Mover nave a la derecha | La nave se detiene en el borde derecho |
| Space | Disparar | Como máximo un proyectil del jugador activo |
| Activación del control de inicio / reinicio | Cambiar de fase | Empieza una partida nueva |

Space no desplaza la página. Al perder el foco de la ventana, las teclas
pulsadas dejan de actuar hasta que se vuelvan a presionar.

## HUD

| Elemento | Formato | Regla de actualización |
|----------|---------|------------------------|
| Puntuación | Entero sin ceros a la izquierda | Aumenta al eliminar enemigos |
| Vidas | Número de 0 a 3 | Baja al recibir un impacto o al llegar un enemigo al fondo |
| Oleada | Entero a partir de 1 | Aumenta al completar una formación |
| Récord | Entero sin ceros a la izquierda | Se actualiza al superarse y persiste |

Cuatro elementos del HUD deben ser visibles simultáneamente durante `playing`;
el récord también es visible en `start` y `gameover`.

## Comportamiento visual

- Paleta retro neón única: fondo oscuro de alto contraste, resplandor en nave,
  enemigos y proyectiles, tipografía coherente y líneas de barrido opcionales.
- La nave parpadea durante la invulnerabilidad, sin desaparecer por completo.
- La animación es continua, sin saltos visibles en el equipo de referencia.
- No se muestran errores técnicos al usuario, incluso si el almacenamiento del
  récord no está disponible.

## Criterios de aceptación de la interfaz

1. Un usuario nuevo identifica el control de inicio en menos de 5 segundos.
2. Puntuación, vidas, oleada y récord son identificables sin explicación.
3. Tras un impacto, el HUD refleja la nueva cantidad de vidas.
4. Al terminar la partida, el botón de reinicio es visible y alcanzable.
5. Un solo clic en reinicio devuelve el juego a `playing` con valores iniciales.
