# Quickstart: Juego Space Invaders Neon

**Feature**: `specs/001-space-invaders-game/spec.md`
**Plan**: [plan.md](../plan.md) | **Modelo**: [data-model.md](../data-model.md)

Esta guía describe cómo ejecutar y validar el juego de extremo a extremo. No
contiene código de implementación; ese detalle corresponde a la fase de tareas.

## Prerrequisitos

- Chrome o Firefox de escritorio en su versión estable actual.
- Node.js 18 o superior solo para ejecutar las pruebas de lógica (sin instalar
  paquetes).
- No se necesita servidor, conexión a internet ni paso de compilación.

## Ejecutar el juego

1. Descargar o clonar el repositorio.
2. Abrir `index.html` con doble clic desde el explorador de archivos.
3. Pulsar el control de inicio de la pantalla inicial.

El juego debe funcionar sin conexión. No deben aparecer errores en la consola
del navegador ni peticiones de red fallidas.

## Pruebas automáticas de lógica

Desde la raíz del repositorio:

```sh
node --test tests/unit/*.test.js
```

Cubrir como mínimo: movimiento y límite de la nave, regla de un solo disparo,
colisiones y puntuación, pérdida de vidas e invulnerabilidad, avance y velocidad
de oleadas, y normalización del récord. Las pruebas no deben requerir DOM.

## Escenarios de validación manual

| # | Pasos | Resultado esperado | Referencia |
|---|-------|--------------------|------------|
| 1 | Abrir el juego y observar la pantalla inicial | Título, instrucción, récord y control de inicio visibles | FR-001, SC-001 |
| 2 | Iniciar y mantener ArrowLeft/ArrowRight | La nave se mueve y se detiene en los bordes | FR-002, SC-002 |
| 3 | Pulsar Space dos veces sin que el primer disparo termine | Solo un proyectil del jugador activo | FR-003 |
| 4 | Disparar a la formación | Enemigo eliminado y puntuación incrementada | FR-005, FR-006 |
| 5 | Dejar que un enemigo baje o recibir un impacto | Una vida menos, parpadeo breve y formación reiniciada | FR-008, FR-009 |
| 6 | Eliminar una formación completa | Nueva oleada, número actualizado y descenso igual o mayor | FR-010, FR-011 |
| 7 | Agotar las vidas | Pantalla final con puntuación y botón de reinicio | FR-012 |
| 8 | Pulsar reinicio dos veces seguidas | Una sola partida nueva con 3 vidas, 0 puntos y oleada 1 | FR-013 |
| 9 | Superar el récord, recargar y volver a abrir | El récord persiste con el mismo valor | FR-014, FR-015, SC-003 |
| 10 | Simular almacenamiento bloqueado o valor corrupto | El juego sigue jugable y muestra un récord válido | FR-015 |
| 11 | Observar el HUD durante una partida | Vidas, puntos, oleada y récord visibles sin explicación | SC-007 |
| 12 | Jugar 10 minutos y observar la animación | Sin saltos ni interrupciones visibles | FR-017, SC-005 |

## Criterios de salida

- Todas las pruebas automáticas pasan.
- Los 12 escenarios manuales terminan con el resultado esperado en Chrome y
  Firefox.
- No hay errores de consola ni peticiones de red.
- La comprobación de la constitución en [plan.md](../plan.md) sigue en PASS.

## Referencias

- Contrato de interfaz: [ui-contract.md](./contracts/ui-contract.md)
- Contrato de persistencia: [storage-contract.md](./contracts/storage-contract.md)
- Decisiones técnicas: [research.md](../research.md)
