# Brief — Estudio (preparación de entrevista, Derecho Penal)

> Fuente de verdad: `CONTRATO_PRODUCTO_ESTUDIO_v5.md`. Este brief no añade requisitos: traduce el
> contrato a decisiones de diseño. Contenido jurídico y personal proviene solo de `PENAL_MD` y
> `ENTREVISTA_MD`. Criterios de experiencia de `UX_PDF`; criterios visuales de `UI_PDF`.

## Audiencia
Una sola usuaria: Valentina Herrera Giraldo, abogada con ~3 años de experiencia jurídica, que
prepara una primera entrevista para Abogada Junior en Derecho Penal. Estudia desde PC y móvil, en
sesiones de 10 minutos y en sesiones largas. Contexto emocional: tiempo limitado, quiere confianza,
no competición ni vigilancia (contrato §4).

## Trabajo principal del usuario (JTBD)
"Cuando tengo un rato libre antes de la entrevista, quiero empezar a practicar lo más importante en
menos de una acción, sin decidir entre decenas de temas, para llegar sabiendo explicar mi experiencia
y los fundamentos penales que me pueden preguntar."

## Acción principal (CTA)
Una sola acción dominante por pantalla (Ley de Hick, UX.pdf): en Home el CTA es **la actividad
recomendada ahora**, con sus minutos. Primer uso sin progreso: **Comenzar preparación** →
"Háblame de ti" (contrato §12.1.1).

## Arquitectura de secciones
- Inicio: contexto, "Qué debes estudiar ahora" (dominante), CTA + minutos, Core Readiness
  Entrevista/Penal, Plan de hoy, Repaso antes de salir, otros temas.
- Estudiar (Ruta): objetivos Nivel 1 por frente; corpus disponible separado de ruta recomendada.
- Practicar: quiz Penal Nivel 1, flashcards, preguntas difíciles.
- Entrevista: Top 10, práctica oral, STAR, "Háblame de ti".
- Más: Casos, Simulacro, Mis errores, Progreso, Preferencias.
- Transversal: búsqueda (Ctrl/Cmd+K), Repaso antes de salir.

Tres caminos principales en Home, no nueve módulos: Seguir plan recomendado · Practicar entrevista ·
Repasar Penal (contrato §12.1).

## Contenido real (sin lorem ipsum)
Todo el copy de estudio se cita de las fuentes con `sourceId/sección/anchor/hash`. El copy de producto
es propio pero sobrio: "Esto es lo que necesitas estudiar ahora", "Este concepto necesita repaso",
"Te conviene revisar medida de aseguramiento", "Ya cubriste los objetivos esenciales de esta sesión".

## Personalidad de marca
Legal contemporáneo + producto digital premium + concentración. Sobria, inteligente, calmada,
confiable. Habla como una colega preparada, no como una app de gamificación.

## Qué NO debe parecer
- Dashboard saturado de estadísticas ni "47 temas pendientes".
- Gamificación: confeti, rachas, insignias, urgencia artificial, countdown dramático.
- Clichés jurídicos: martillos, balanzas, columnas griegas, dorados.
- SaaS genérico: hero centrado + 3 cards de features; gradiente morado; glassmorphism.
- Visor de Markdown: nunca una página larga de documento.
- Evaluación de personalidad: ninguna nota tipo "84/100 como abogada".

## Restricciones duras
Local-first, sin backend, login, IA, telemetría, APIs, CDN de fuentes ni imágenes remotas. Offline
después de build. Progreso en almacenamiento local del navegador; PC y móvil no se sincronizan y la
app lo declara. WCAG 2.2 AA en los flujos principales. Targets >=44px (48 en móvil).
