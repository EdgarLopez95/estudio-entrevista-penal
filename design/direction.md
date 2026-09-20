# Dirección visual — Estudio

## Idea visual central
**Un expediente sereno.** La pantalla se lee como una carpeta de trabajo bien ordenada: una sola cosa
manda, el resto espera en silencio. Nada compite con la decisión de qué estudiar ahora.

## Elemento memorable
El **lomo del expediente**: una regla vertical de 2px a la izquierda del bloque dominante que cambia de
color según el frente (Entrevista = arcilla, Penal = azul). Es el único uso de color de identidad en toda
la interfaz; aparece también, a 1px, en los medidores de Core Readiness, que son **barras segmentadas
por objetivo** (un segmento = un LearningObjective), no porcentajes gritados. Así el progreso se ve
"por metas" y no "por cantidad de preguntas" (contrato §8.5).

## Color — roles semánticos (contrato §18.1)
Neutros premium cálidos + un acento sobrio. Dos hues de identidad, usados solo en reglas de 1–2px,
etiquetas y estados; nunca como relleno decorativo ni gradiente.

| Rol | Light | Dark |
|---|---|---|
| `background` | `#F7F6F4` | `#121415` |
| `surface-1` | `#FFFFFF` | `#191C1E` |
| `surface-2` | `#F1EFEC` | `#202426` |
| `surface-3` | `#E8E5E0` | `#282D30` |
| `text-primary` | `#1A1C1E` | `#ECEAE6` |
| `text-secondary` | `#474C52` | `#B6BBBF` |
| `text-muted` | `#63696F` | `#949A9F` |
| `outline` | `#D9D5CF` | `#32383B` |
| `primary` | `#1C4A6B` | `#9AC8EC` |
| `primary-hover` | `#163B57` | `#B4D8F4` |
| `primary-active` | `#0F2C42` | `#7FB6DF` |
| `on-primary` | `#FFFFFF` | `#0D1B27` |
| `success` | `#1C6647` | `#7FC9A3` |
| `warning` | `#7E5310` | `#E3B570` |
| `error` | `#94252A` | `#F3A09A` |
| `info` | `#1C4A6B` | `#9AC8EC` |
| `focus-ring` | `#1C4A6B` | `#9AC8EC` |
| `track-interview` | `#8F5334` | `#DDA482` |
| `track-penal` | `#1C4A6B` | `#9AC8EC` |

Contraste verificado por script (`npm run check:contrast`): texto normal >=4.5:1, texto grande y
componentes >=3:1, en light y dark. Ningún estado depende solo del color: siempre icono + texto.

## Tipografía
- Familia única: **Geist Sans**, empaquetada localmente (`@fontsource-variable/geist`), `display: swap`.
  Fallback declarado: `system-ui, -apple-system, "Segoe UI", sans-serif`. Sin Google Fonts CDN.
- **Geist Mono** local para labels, contadores y metadatos (`8/10 practicadas`, `5 min`).
- Escala fluida con `clamp()` y roles: Display, H1, H2, H3, Title, Body, Body Small, Label, Caption.
  Pocas variantes, bien usadas (UI.pdf). Lectura larga limitada a 66ch.
- Jerarquía por escala + peso + espacio, nunca por "poner bold".

## Retícula, ritmo y densidad
- Spacing tokens: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Micro (4–12) dentro de un grupo; 24 padding de
  card en desktop; 32 entre bloques; 48–64 macro entre secciones.
- Desktop: sidebar fija 264px + contenido `max-width: 1120px`; dashboard más ancho, lectura 66ch.
- Móvil: gutter 16px constante, una columna, sin scroll horizontal.
- **Separación por espacio y superficie, no por bordes**: hairline `outline` de 1px solo donde el
  agrupamiento no basta. Elevación máxima: `0 1px 2px rgba(0,0,0,.05)`; en dark, solo cambio de
  superficie.
- Radios: 12px card, 10px control, 8px chip, 999px pill. Un radio por categoría, sin excepciones.
- Targets: 44px mínimo, 48px en móvil, separación >=8px.

## Wireframes

### Home — desktop (>=1024px)

```
+--------------+-----------------------------------------------------------+
| Estudio      |  Entrevista: 21 sep - Modo Primera entrevista      [^K]   |
|              +-----------------------------------------------------------+
| Inicio     o |  | QUE DEBES ESTUDIAR AHORA                               |
| Ruta         |  | Hablame de ti: pasado-presente-siguiente paso          |
| Flashcards   |  | Porque es la primera pregunta y no la has practicado    |
| Practica     |  | [ Practicar en voz alta - 5 min ]  Elegir otra cosa     |
| Casos        +-----------------------------------------------------------+
| Entrevista   |  Cuanto tiempo tienes ahora?                              |
| Simulacro    |  [10 min][20 min][30 min][1 hora][Sesion completa]         |
| Mis errores  +--------------------------+--------------------------------+
| Progreso     | PREPARACION ESENCIAL     | PLAN DE HOY - 20 min           |
|              | Entrevista ####____ 4/12 | 1 Hablame de ti        5 min   |
| Preferencias | Penal      ##______ 2/17 | 2 Por que Penal        5 min   |
|              | Top 10 - Dificiles       | 3 STAR: error          5 min   |
|              | Penal esencial           | 4 Imputacion/acusacion 5 min   |
|              +--------------------------+--------------------------------+
|              | Repaso antes de salir - 10 min          Otros temas ->    |
+--------------+-----------------------------------------------------------+
```

Un solo foco (la recomendación) + un soporte (tiempo). Las estadísticas no llenan el viewport.

### Home — móvil (primer viewport completo, 360–390px)

```
+----------------------------+
| Estudio            Q  moon |
| Entrevista: manana         |  <- contexto
|                            |
| | QUE DEBES ESTUDIAR AHORA |  <- recomendacion
| | Hablame de ti            |
| | Primera pregunta, sin    |
| | practicar                |
| | [Practicar - 5 min]      |  <- CTA + minutos (48px)
|                            |
| Entrevista ####____  4/12  |  <- Core Readiness
| Penal      ##______  2/17  |
+----------------------------+  <- fin del primer viewport
| Cuanto tiempo tienes?      |
| [10][20][30][1h]           |
| Plan de hoy ...            |
+----------------------------+
| Inicio Estudiar Practicar  |
|   Entrevista    Mas        |  <- bottom nav, 5 destinos
+----------------------------+
```

### Práctica oral de entrevista

```
+ Salir ---------- Entrevista - 3 de 5 --------------- ###__ +
|                                                            |
|  La entrevistadora pregunta                                |
|  Que experiencia concreta tienes en Derecho Penal?         |
|                                                            |
|  Respondelo en voz alta. Cuando termines, continua.        |
|                                                            |
|  [ He respondido ]        Ver guia (despues de intentar)    |
+------------------------------------------------------------+
      v tras "He respondido"
+ Como te salio? --------------------------------------------+
| [Me quede en blanco] [Parcial] [Bien]                      |
| Que cubri?   [ ] Juzgados 2o y 3o de ejecucion             |
|              [ ] Expedientes de condenados                 |
|              [ ] No afirmar litigio que no ha hecho        |
| Idea que debe quedar - puntos clave - (Respuesta modelo >)  |
| Fuente de estudio: ENTREVISTA_MD 5                         |
+------------------------------------------------------------+
```

La respuesta modelo es apoyo secundario y colapsado: nunca se presenta como guion obligatorio.

### Quiz Penal Nivel 1

```
 Pregunta 2 de 4 - Imputacion y acusacion - Nivel 1      ##__
 Que distingue la acusacion de la imputacion?
 +----------------------------------------------------------+
 | ( ) Opcion A                                             |  idle/hover/focus/selected
 | (o) Opcion B                                             |
 +----------------------------------------------------------+
 [ Comprobar ]
 -> tras enviar: OK Correcto / X Revisa esto + explicacion breve
   > Ver mas detalle (apoyo, no amplia el nivel)
   Fuente de estudio: PENAL_MD 19
```

## Plan de motion (100–250ms, contrato §18.2)
- Entrada de pantalla: `opacity 0→1` + `translateY(4px→0)`, 180ms, escalonado 40ms entre bloques
  (máximo 3 bloques). Nunca anima el bloque que contiene la recomendación después del primer render.
- Cambio de paso en práctica: cross-fade 140ms; la barra de progreso interpola 200ms.
- Flashcard: flip 180ms sobre eje Y; con `prefers-reduced-motion` se sustituye por cambio inmediato.
- Feedback de respuesta: aparición sin movimiento (140ms opacity) para no desviar la lectura.
- Hover/press: 120ms sobre `background-color` y `border-color` (nunca `transition: all`).
- `prefers-reduced-motion: reduce` → todas las duraciones a 0.01ms, sin transform.
- No se anima información esencial ni hay confeti.

## Autocrítica contra genericidad
1. *¿Parece plantilla SaaS?* Se eliminó el patrón hero-centrado + 3 cards: Home es asimétrica, con un
   bloque dominante alineado a la izquierda y soportes de menor peso.
2. *¿Gradiente morado / glassmorphism?* No hay gradientes ni transparencias; profundidad solo por
   superficie y una sombra de 1px.
3. *¿Todo son cards con el mismo radio y sombra?* El Plan de hoy es una **lista numerada con hairlines**,
   no cards; Core Readiness son barras segmentadas sobre el fondo; solo la recomendación y el repaso
   usan contenedor.
4. *¿Las decisiones salen del producto?* Sí: el lomo de color existe porque el producto tiene dos
   frentes (65/35) que hay que distinguir sin etiquetas ruidosas; los segmentos existen porque el
   contrato exige medir por objetivos, no por preguntas.
5. *¿Clichés jurídicos?* Ningún martillo, balanza ni columna. La única referencia al mundo legal es la
   sobriedad tipográfica y la palabra "expediente" en el concepto interno.
6. *Riesgo detectado:* dos hues de identidad podían volverse decorativos. Se limitan a reglas de
   1–2px, etiquetas y medidores; los rellenos siempre son neutros.
