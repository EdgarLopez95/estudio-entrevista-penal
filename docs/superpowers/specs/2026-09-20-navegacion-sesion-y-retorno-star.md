# Navegación de sesión y retorno desde historias STAR

## Objetivo

Hacer continuo el recorrido de una sesión: los controles anterior/siguiente deben estar arriba y
abajo, cada cambio de recurso debe iniciar arriba y las historias STAR deben regresar al punto de
origen.

## Diseño

- La sesión muestra una barra de navegación antes y después del contenido con Anterior, posición
  y Siguiente; la inferior permanece sticky y accesible en móvil.
- Cualquier cambio de índice desplaza la ventana a `top: 0` y enfoca el encabezado de la nueva
  actividad.
- Los enlaces a STAR originados en una sesión llevan un estado de retorno con el índice actual.
- La pantalla STAR muestra migas `Entrevista › Pregunta actual › Historia STAR` y una acción
  `Volver a la pregunta` que regresa a la sesión y repone el mismo índice.
- Un enlace a STAR fuera de sesión conserva el retorno existente a Entrevista.

## Pruebas

- Navegar siguiente/previo cambia índice, hace scroll al inicio y conserva el modo.
- Una STAR abierta desde una sesión muestra migas y retorna a la pregunta de origen.
- Las pruebas móviles verifican que la barra inferior no causa scroll horizontal ni tapa el foco.
