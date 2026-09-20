# Elección: preparar o practicar una respuesta de entrevista

## Objetivo

Una persona que abre una pregunta de entrevista debe poder escoger de inmediato entre estudiar su
respuesta o simularla. La pantalla actual prioriza la simulación y puede exigir una respuesta sin
haber mostrado la guía.

## Flujo elegido

La vista de cada pregunta mostrará dos acciones explícitas antes de cualquier intento:

1. **Prepararme primero** (acción principal): revela una guía estructurada con la idea central,
   los puntos clave, qué evitar y la respuesta recomendada como apoyo.
2. **Practicar ahora** (acción secundaria): conserva la dinámica actual de responder en voz alta
   antes de ver la guía.

Tras estudiar la guía, la persona podrá iniciar la práctica sin cambiar de pantalla. Tras un
intento, podrá volver a consultar la guía y guardar su resultado como hasta ahora.

## Límites

- No se crea contenido nuevo ni se altera el contenido curado existente.
- La respuesta recomendada seguirá identificada como apoyo, nunca como texto para memorizar.
- No cambia el registro de progreso ni los resultados de los simulacros.

## Pruebas

- Una prueba de interfaz comprobará que cada prompt ofrece ambas decisiones antes del intento.
- Otra comprobará que «Prepararme primero» hace visible la guía y permite pasar a practicar.
- Las pruebas existentes de guardar la práctica deben seguir pasando.
