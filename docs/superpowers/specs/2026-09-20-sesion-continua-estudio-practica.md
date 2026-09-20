# Sesión continua de estudio o práctica por nivel

## Objetivo

Eliminar la decisión repetida en cada pregunta de entrevista. Una sesión escoge una sola vez si
la persona quiere estudiar o practicar y recorre un bloque ordenado del nivel activo sin volver al
índice.

## Alcance de la sesión

- El primer acceso a Entrevista o el CTA de entrevista pide `Estudiar / Prepararme` o
  `Practicar / Ensayar` solo si no hay una sesión de entrevista activa.
- La sesión se crea con prompts del bloque solicitado y del nivel activo. Con Nivel 1 será el
  bloque de diez preguntas esenciales; Nivel 2 solo se incluye si está activado en Preferencias.
- La lista de entrevista sigue siendo un índice: abre un prompt dentro de la sesión activa y su
  modo actual, o crea la elección inicial si no hay sesión.

## Presentación

- **Estudiar:** abre primero idea central, puntos clave, estructura, respuesta de apoyo, qué
  evitar y STAR relacionada. Avanzar marca el recurso como estudiado sin crear un intento oral.
- **Practicar:** abre la pregunta sin ayuda; después de `Ya respondí` muestra guía,
  autoevaluación y puntos cubiertos. Guardar registra el intento oral actual.
- Ambos modos muestran un indicador discreto de modo y una acción secundaria para cambiar entre
  ellos sin recrear ni abandonar la sesión.
- Una barra de navegación accesible y fija al final de la vista ofrece Anterior, posición y
  Siguiente. En móvil mantiene objetivos táctiles grandes y no cubre el foco.

## Final de bloque

Tras la última pregunta se muestra una pantalla de finalización con: repasar elementos a reforzar,
continuar a Penal esencial y terminar por ahora. No se ofrece una elección de modo entre preguntas.

## Datos y compatibilidad

- `ActiveSession` incorpora un modo de presentación `study | practice` independiente de su
  `SessionMode` de planificación.
- El modo se persiste con la sesión activa y se conserva al navegar, recargar o abrir un prompt
  desde la lista.
- El registro de intento oral existente conserva `blank`, `partial`, `good` y key points.
- Estudiar se registra separadamente como recurso estudiado y no genera errores de práctica.
- Las sesiones guardadas anteriores sin el nuevo campo se interpretan como práctica para evitar
  bloquear su continuación.

## Pruebas de aceptación

- Elegir modo una vez genera una sesión continua del bloque permitido por nivel.
- Estudiar permite avanzar por dos prompts sin volver a pedir modo y registra estudio.
- Practicar conserva el modo, exige autoevaluación antes de avanzar y registra el intento.
- Cambiar modo no altera índice ni lista de recursos de la sesión.
- La navegación anterior/siguiente funciona con teclado y en viewport móvil.
- Terminar el bloque muestra las tres acciones de cierre.
