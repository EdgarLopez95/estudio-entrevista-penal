# Contrato maestro de producto - Estudio para entrevista de Derecho Penal

| Campo | Valor |
|---|---|
| Versión | **0.5** |
| Fecha | 20 de septiembre de 2026 |
| Estado | **FINAL DRAFT — PENDIENTE DE APROBACIÓN** |
| Propósito | Fuente contractual auditable para una aplicación local-first de preparación de Valentina Herrera Giraldo para entrevista de Abogada Junior en Derecho Penal. |
| Alcance | Especificación únicamente. No autoriza código, dependencias, inicialización de proyecto ni conversión de contenido. |

## 1. Propósito

La aplicación será una herramienta interactiva de aprendizaje, no un visor de Markdown ni un dashboard de actividad. Debe ayudar a Valentina a saber qué estudiar, comprender, recordar activamente, practicar preguntas y casos, entrenar respuestas de entrevista en voz alta, detectar errores, medir preparación, repasar debilidades y hacer un repaso final breve.

Preguntas rectoras: **¿esta decisión ayuda a Valentina a saber qué estudiar, comprenderlo, recordarlo y demostrar que lo sabe?** y **¿esto es suficientemente importante para consumir tiempo de estudio antes de la entrevista?** Si no satisface ambas en el contexto inmediato, se excluye de la ruta activa o se muestra como profundización.

El objetivo no es terminar todo el corpus: es llegar a la entrevista dominando primero el contenido de mayor valor esperado para esta preparación. El producto no es asesoría jurídica para casos reales, no certifica competencia profesional ni garantiza resultado en entrevista. Su corpus jurídico conserva el aviso de verificar norma y jurisprudencia vigentes para cualquier actuación real.

## 2. Manifiesto de fuentes

La raíz es `Estudio/`. Los originales externos no fueron modificados; las cuatro fuentes se copiaron a `docs/sources/`. Los hashes son SHA-256 de los archivos copiados.

| id | filename | relativePath | tipo | autoridad y finalidad | incorporación / versión | SHA-256 | limitaciones | Jurídico | Hechos personales | UX/UI |
|---|---|---|---|---|---|---|---|---|---|---|
| `PENAL_MD` | `Valentina_Repaso_Derecho_Penal_Entrevista.md` | `docs/sources/Valentina_Repaso_Derecho_Penal_Entrevista.md` | Markdown | Fuente maestra jurídica: prioridades, doctrina de estudio, preguntas, casos y advertencias | 2026-09-20 / sin versión explícita | `C690C38F956724FE1B7605CECFB1962207BB02814E347C3BE16921B6B7A5DB37` | Material para entrevista, no concepto jurídico concreto | Sí | No | No |
| `ENTREVISTA_MD` | `Valentina_Preparacion_Entrevista_Derecho_Penal.md` | `docs/sources/Valentina_Preparacion_Entrevista_Derecho_Penal.md` | Markdown | Fuente maestra personal: respuestas, hechos, STAR, salario y preparación de entrevista | 2026-09-20 / sin versión explícita | `4FB9EC5E0D57806EACA22789A4F40AE039E42CF78BB80B2A43054D19E466B535` | No convertir experiencia transferible en litigio directo; contiene información personal profesional | No | Sí | No |
| `UX_PDF` | `UX.pdf` | `docs/sources/UX.pdf` | PDF | Criterios de usabilidad, accesibilidad, comportamiento y validación | 2026-09-20 / sin versión explícita | `F3120F9E2C6788318DDCC12DA0FA409A9D48C844B73C450E2FE2134C8762F30D` | Guía de criterios, no aporta doctrina ni hechos personales | No | No | Sí, UX |
| `UI_PDF` | `UI.pdf` | `docs/sources/UI.pdf` | PDF | Criterios de retícula, jerarquía, diseño visual y sistema de componentes | 2026-09-20 / sin versión explícita | `3E1D2B662EE25010C7F71A124ABDA965A884022342FF522D834FC83C5892FF2C` | Guía visual, no aporta doctrina ni hechos personales | No | No | Sí, UI |

Una fuente futura exige ID, ruta relativa, tipo, autoridad, finalidad, fecha, versión si existe, hash, limitaciones y permisos de aporte. Si un hash cambia, el corpus derivado afectado debe revisarse y subir `contentVersion`; no se sobrescribe silenciosamente.

## 3. Jerarquía de autoridad

1. Este contrato, tras aprobación, gobierna producto, arquitectura, pedagogía, comportamiento, UX y UI.
2. `PENAL_MD` gobierna exclusivamente contenido jurídico de estudio.
3. `ENTREVISTA_MD` gobierna exclusivamente hechos de Valentina, respuestas personales, STAR, salario y preparación de entrevista.
4. `UX_PDF` gobierna criterios de experiencia y usabilidad.
5. `UI_PDF` gobierna criterios visuales y de design system.

No se permite que UI cambie contenido jurídico; UX invente contenido; Penal defina visuales; una respuesta personal modifique doctrina; ni que conocimiento general del agente prevalezca silenciosamente. Conflicto real: recurso `blocked`, registro en Decision Log y revisión humana.

## 4. Usuario, contexto y tono

Una usuaria principal, Valentina, estudia sesiones largas, cortas y de última hora desde desktop y móvil. Necesita continuidad, concentración, confianza y explicaciones claras; no competición ni vigilancia.

Idioma principal: español. Tono: profesional, directo, tranquilo, claro y alentador sin infantilizar. Preferir “Correcto”, “Este concepto necesita repaso” y “Te conviene revisar medida de aseguramiento”. Prohibir “¡Eres una crack!”, “¡Brutal!”, rachas de fuego, amenazas de pérdida y copy que avergüence.

## 5. Principios no negociables

- Fidelidad: no inventar experiencia, litigio, audiencias, responsabilidad, cifras, artículos, jurisprudencia ni conocimientos.
- Trazabilidad: ningún recurso definitivo sin fragmento fuente verificable.
- Determinismo: no se genera contenido jurídico en runtime con LLM. Preguntas, flashcards, distractores, explicaciones, casos y respuestas se crean durante curaduría, se almacenan, validan y versionan.
- Aprendizaje: recuperación, feedback y corrección sostenida por encima de lectura o puntuación vacía.
- Control y ética: recomendaciones explicables e ignorables; sin urgencia falsa, bloqueos, castigo por pausas ni dark patterns.
- Sistema antes que pantallas: foundations y biblioteca común antes de UI aislada.

## 6. Privacidad, seguridad y offline

MVP local-first: ningún progreso, respuesta personal o fuente sale del dispositivo. No hay login, cuenta, servidores, trackers, Google Analytics, telemetría externa, API, IA externa, script remoto, fuente CDN, imagen remota ni datos jurídicos en vivo durante runtime.

Durante desarrollo pueden descargarse dependencias, pero la aplicación construida no requiere conexión permanente. Tipografías y recursos se empaquetan localmente. Las métricas locales permitidas se limitan a sesiones completadas, errores, tiempo aproximado opcional, progreso, abandono y preguntas respondidas; no se mide cada clic ni se usa para vigilancia.

El acceso desde móvil es responsive y local-first. Si se usa por red local, ningún dato debe salir a internet; sin sincronización P0-A, el progreso del navegador del PC y el del móvil puede ser independiente. No se promete sincronización entre dispositivos.

## 7. Modelo pedagógico

Ciclo obligatorio: **aprender -> recordar -> practicar -> equivocarse -> entender el error -> repasar -> volver a evaluar -> dominar**.

Se usa recuperación activa, reconocimiento cuando corresponda, chunking, feedback inmediato, dificultad progresiva, repetición de errores e intercalado justificado. La lección tiene título, bloque, tiempo estimado, progreso, idea esencial, explicación, qué recordar, diferencia si aplica, ejemplo fuente, mini comprobación y siguiente acción. Nunca se renderiza un MD largo.

### 7.1 Evaluación objetiva y preparación personal

**Conocimiento objetivamente evaluable:** conceptos, quizzes y pasos verificables de casos. Puede ser correcto/incorrecto.

**Preparación de entrevista:** intento oral, cobertura de puntos clave fuente, autoevaluación y repetición. No se califica personalidad, voz, estilo ni “qué tan buena abogada es”. No se mezcla como una única nota 84/100 sin explicar.

Un Índice de preparación puede sintetizar entrenamiento, siempre desglosado y rotulado como indicador de entrenamiento, no nota profesional.

### 7.2 Study-Practice Alignment

Cada sesión mantiene alineación estricta: **contenido expuesto -> objetivo de aprendizaje -> práctica -> feedback -> repaso**. Si la usuaria trabaja Nivel 1, no se le evalúa con Nivel 2/3 ni mediante distractores, feedback o texto auxiliar que exijan conocimiento superior. Intercalado significa mezclar objetivos ya estudiados dentro del scope permitido, nunca mezclar capas.

No hay sorpresas: el producto no penaliza desconocer contenido fuera de ruta activa o no declarado como conocimiento previo. Después de una unidad importante, una comprobación inmediata de 1-3 preguntas/prompt mide el mismo objetivo; sesiones posteriores pueden intercalarlo dentro de la capa vigente.

### 7.3 LearningObjectives y Coverage Matrix

Entidad **LearningObjective**: `id`, `title`, `track`, `level`, `priority`, `sourceId/sourceSection/sourceAnchor`, `estimatedMinutes`, `resourceIds`, `questionIds`, `flashcardIds`, `caseIds?`, `allowedPrerequisiteObjectiveIds?`. Ejemplos: `LO-PENAL-IMPUTACION-ACUSACION`, “Distinguir imputación de acusación”; `LO-INTERVIEW-SALIDA-TRANSUNION`, “Explicar cambio sin hablar negativamente del empleador”.

La Coverage Matrix es obligatoria y auditable: **LearningObjective -> lección -> flashcard -> pregunta(s) -> caso/prompt si aplica -> nivel -> fuente**. No se publica un objetivo crítico que tenga lección sin práctica, ni pregunta sin contenido previo o objetivo. Prerrequisitos son opcionales, mínimos y nunca crean un grafo bloqueante.

### 7.4 Sistema de práctica estratificado

El banco se divide por nivel, track y objetivo; no es una colección indiscriminada. Toda pregunta incluye `track`, `level`, `priority`, `questionType: recall | distinction | application | situational | case | interview`, `interviewStageRelevance`, `estimatedMinutes`, `sourceId/sourceSection/sourceAnchor`, `learningObjectiveId` y, si aplica, prerequisitos.

Práctica oral es predeterminada para entrevista: pregunta -> responder en voz alta -> autoevaluación -> key points -> modelo opcional. Opción múltiple se reserva principalmente para Penal, diferencias, escenarios breves y aplicación; en entrevista es secundaria para reconocer errores/evitar respuestas problemáticas. Cross-track se entrena como entrevista precisa sobre experiencia real, no como doctrina.

## 8. Estrategia de triage para entrevista inmediata

### 8.1 Dos frentes y modo por defecto

El modo por defecto es **Primera entrevista**: Frente A, Entrevista personal/profesional, tiene prioridad principal; Frente B, Derecho Penal técnico, es obligatorio pero secundario. La ponderación orientativa de tiempo y prioridad es Entrevista 65% / Penal 35%; no predice qué preguntará un entrevistador ni afirma probabilidades.

Frente A cubre trayectoria, motivación, experiencia real, brechas, trabajo bajo presión, ética, comunicación, disponibilidad, salario, preguntas al despacho y STAR. Frente B cubre primero experiencia penal real, fundamentos, proceso básico, diferencias preguntables, ejecución de penas, hábeas corpus y razonamiento de hipotéticos. El modo futuro manual “Quiero prepararme más técnicamente” aumenta profundidad Penal, casos, prueba y proceso.

### 8.2 Niveles de la ruta recomendada

| Nivel | Sentido | Contenido y exposición |
|---|---|---|
| 1 - Imprescindible | Prioridad ahora | Único nivel con señales visuales fuertes y parte de Core Readiness. |
| 2 - Muy conveniente | Si ya manejo lo esencial | Profundiza; visible como siguiente opción, sin competir con Nivel 1. |
| 3 - Profundización | Solo si queda tiempo | Disponible, tenue y fuera del denominador Core Readiness. |
| Referencia | Consulta | Artículos exactos, fuentes y material ampliado; no integra plan activo ni indicador principal. |

Nivel 1 Entrevista contiene como mínimo el Mini simulacro fuente: Háblame de ti, Por qué Penal, experiencia penal real, litigio, salida de TransUnion, error, presión, debilidad, por qué contratarte y expectativa salarial; añade contratos temporales, juzgados, disponibilidad, qué sabe/no sabe hacer, cómo aprende y STAR principales. Nivel 1 Penal contiene experiencia penal real; conducta punible; tipicidad/antijuridicidad/culpabilidad; dolo/culpa; tentativa; autor/coautor/cómplice; proceso básico; jueces; captura/flagrancia; imputación/acusación; medida; teoría del caso; estándar de condena; hábeas corpus; juez de ejecución; libertad condicional/redención conceptual; y método de análisis. Los artículos son apoyo, nunca meta de memorización masiva.

Nivel 2 incluye conflictos, crítica, decisión difícil, cliente, equipo, ética adicional, carga, cinco años, aprendizaje y preguntas al despacho; y en Penal, ausencia de responsabilidad, inimputabilidad, descubrimiento/preparatoria, EMP/evidencia/prueba, cadena, pertinencia, admisibilidad, prueba ilícita, víctimas, defensa, prisión domiciliaria, suspensión y casos. Nivel 3 incluye concurso, posición de garante profunda, preclusión, oportunidad, preacuerdos, nulidades, recursos, prescripción, distinciones finas y ejercicios adicionales. Todo sigue disponible; nada avanzado se muestra como deuda.

Colecciones derivadas sin duplicar datos: **Top 10 - Primera entrevista**, los diez prompts del mini simulacro fuente; **Preguntas difíciles**, preguntas personales que pueden afectar candidatura y están respaldadas por `ENTREVISTA_MD`; y **Penal esencial para entrevista**, ruta inicial compacta de aproximadamente 12-18 conceptos de Nivel 1. Las tres se acceden desde Home, Entrevista o Repaso antes de salir según corresponda.

### 8.3 Progresión, calma y stop rule

La Home prioriza en orden: Nivel 1 entrevista no practicado; Nivel 1 entrevista en blanco/parcial; error crítico Nivel 1; cross-track crítico; Penal Nivel 1 no dominado; duda Nivel 1; sesión esencial inconclusa; Nivel 2 relevante; Nivel 3 solo con buen dominio y tiempo. No bloquea “Ver todos los temas”, pero es acción secundaria.

La interfaz inicial dice “Esto es lo que necesitas estudiar ahora”, no “47 temas pendientes”. Puede mostrar “No es prioridad ahora: sigue disponible después de Nivel 1” para reducir ansiedad. Si ambas áreas esenciales están suficientemente preparadas, no hay error crítico y preguntas principales fueron practicadas, comunica: “Ya cubriste los objetivos esenciales de esta sesión”, con Reforzar errores / Profundizar si tienes tiempo / Terminar por ahora. Nunca certifica “Estás lista como abogada”.

### 8.4 Scope, modos y presupuesto de sesión

El Session Builder recibe exclusivamente `activeTrack`, `activeLevel/maxLevel`, `timeBudget`, `mode`, `allowedObjectiveIds`, `recentErrors`, `recentDoubts`, `newQuestionBudget` y `reviewQuestionBudget`. Guarda `sessionScope` con esos valores y no lo amplía silenciosamente. Al completar una capa ofrece, sin bloquear: “Ya cubriste esta capa. ¿Quieres añadir Nivel 2?”.

Modos: **Practicar lo que acabo de estudiar** (solo objetivos de sesión); **Practicar nivel actual** (objetivos del nivel activo); **Repaso mixto** (estudiado, errores, dudas y cross-track). Ninguno introduce capas superiores al máximo escogido.

Question budget orientativo: 10 min, 3-5 preguntas/prompts; 20 min, 5-8; 30 min, 8-12; 1 hora, bloques cortos con pausa/cambio. Prompts orales pesan más que selección múltiple. Se prefieren pocas preguntas, feedback útil y repetición de error; no 30 consecutivas. Una misma meta crítica puede variar definición/distinción/aplicación, sin duplicado literal.

### 8.5 Blueprints y cobertura

**QuizBlueprint** declara track, level, maxLevel, número, objetivos y distribución de tipos (fundamento/distinción/aplicación), para cubrir metas relevantes sin seis preguntas de tipicidad y ninguna de medida/hábeas. **InterviewPracticeBlueprint Nivel 1** cubre presentación/motivación, experiencia Penal, cambio laboral, pregunta difícil, STAR, condiciones y un follow-up fuente. **Quick** usa exclusivamente Nivel 1: 4-5 personal/profesional y 2-3 Penal/cross-track. **Standard** Primera entrevista es 60-70% entrevista y 30-40% Penal/cross-track; solo añade Nivel 2 si la usuaria lo estudió o activa “Incluir Nivel 2”. **Full** requiere solicitud explícita y comunica profundización.

Question Readiness se mide por objetivos, no conteo bruto: Top 10 practicadas/bien/parcial/sin practicar; Penal esencial objetivos cubiertos/dominados/necesita repaso/no evaluados. Diez preguntas sobre una meta siguen siendo evidencia de una sola meta, no diez temas. El total del banco no aparece como denominador ni deuda.

## 9. Taxonomía y prioridades de contenido

Todo el corpus estará estructurado, pero se separa **Corpus disponible** de **Ruta recomendada**. Los filtros obligatorios son `track: interview | penal | cross-track`, `level: 1 | 2 | 3 | reference`, `priority: critical | high | medium | reference`, `estimatedMinutes: 2 | 5 | 10 | 15 | 20` e `interviewStageRelevance: initial | technical | any`. Este último orienta estudio, no predice procesos reales.

Penal: `critical` para “Prioridad máxima” de `PENAL_MD`; `high` para “Segunda prioridad”; `medium/reference` para el resto según utilidad expresa. Ruta: teoría del delito; proceso penal acusatorio; prueba y decisión; garantías/salidas/ejecución; análisis aplicado.

Entrevista: prioridad alta para Mini simulacro de alta probabilidad, presentación, motivación, experiencia real, ética, presión, disponibilidad, salario, preguntas al despacho y STAR. “¿Qué experiencia concreta tienes en Derecho Penal?” es `cross-track` y crítica: debe conectar Juzgado Segundo/Tercero, ejecución, población privada de libertad, tutelas/hábeas corpus, autos, documentos judiciales, diferencia con litigio privado y qué quiere aprender. No se altera intención, cifras ni límites de fuente.

## 10. Arquitectura de información

Secciones: Inicio, Ruta de estudio, Flashcards, Práctica, Casos, Entrevista, Simulacro, Mis errores y Progreso. Búsqueda, preferencias y modo auditoría son secundarios.

Primer uso: Home y mensaje corto de siguiente acción, con tooltip contextual opcional. No onboarding de cinco pantallas. La interfaz enseña mediante la tarea.

## 11. Navegación responsive y concentración

Desktop: sidebar persistente. Móvil: bottom navigation con máximo cinco destinos: Inicio, Estudiar, Practicar, Entrevista y Más. Más: Casos, Simulacro, Mis errores, Progreso y Preferencias. Búsqueda con Ctrl/Cmd+K en desktop y botón visible en móvil. Cualquier cambio exige Decision Log.

En flashcards, quiz, casos, entrevista y simulacro se reduce chrome, pero se conserva salir/cerrar, contexto y progreso. Confirmar salida solo si se perdería trabajo; no obligar a navegar por sidebar durante sesión.

## 12. Experiencias funcionales

### 12.1 Home

Desktop: 1) header/contexto, 2) “Qué debes estudiar ahora” dominante, 3) CTA de actividad prioritaria y minutos, 4) Plan de hoy, 5) Preparación esencial separada: Entrevista y Penal, 6) Repaso antes de salir, 7) otros temas. No llenar el viewport con estadísticas.

Móvil, sin scroll idealmente: entrevista próxima/contexto, qué estudiar ahora, CTA principal, tiempo estimado, Entrevista esencial y Penal esencial. Después del primer viewport aparece Plan de hoy. Continuar utiliza `lastResourceId`, `lastMode` y posición útil; no abre siempre el primer tema.

Home solo presenta tres caminos principales: **Seguir plan recomendado**, **Practicar entrevista** y **Repasar Penal**. El resto está disponible desde navegación, no como nueve módulos competidores.

#### 12.1.1 Plan de hoy, selector de tiempo y día de entrevista

`Plan de hoy` es P0, determinista y corto: usa tiempo disponible, targetInterview, Nivel 1 pendiente/fallado/dudado, entrevista sin práctica y Penal esencial no dominado. No es calendario. El selector “¿Cuánto tiempo tienes ahora?” ofrece 10 min, 20 min, 30 min, 1 hora y Sesión completa. Una sesión normal contiene aproximadamente 5-10 elementos relevantes; no recomienda actividad de 20 min si se eligieron 10.

Con target D-1/Hoy, se priorizan respuestas difíciles, STAR reales, blancos/parciales, base Penal esencial y mini simulacro. Si targetInterview.date es hoy, Home cambia a recall: “Hoy conviene reforzar lo que ya preparaste”, con Repaso antes de salir, Preguntas difíciles, Penal esencial y Mis errores. No incorpora grandes bloques nuevos. Tras la fecha cambia a Modo estudio sin romper datos.

Después de aproximadamente 20-30 minutos continuos, puede sugerir: “Has completado este bloque. Puedes descansar o continuar.” Nunca condiciona continuar a una racha.

Plantillas flexibles: **10 min** = 2 entrevistas prioritarias + 1 STAR/cross-track + 2-3 comprobaciones Penal; **20 min** = 3-4 entrevistas + 1 STAR + 1 concepto Penal breve + 3-4 preguntas Penal; **30 min** = bloque entrevista + STAR + 2 conceptos Penal + práctica corta; **60 min** = bloques breves, cambio de modalidad y mini simulacro final. Error Nivel 1 sustituye contenido nuevo.

Primer uso sin progreso no muestra dashboard vacío: “Tu preparación comienza por lo esencial.” CTA **Comenzar preparación**; primera actividad: “Háblame de ti”; luego sigue el orden Nivel 1 del Apéndice A e intercala Penal según la secuencia.

### 12.2 Flashcards

Pregunta -> pensamiento -> mostrar respuesta -> `No la sabía` / `Dudé` / `La sabía`. Modos: general, tema, falladas, dudas y repaso rápido. Sin streaks ni premios.

### 12.3 Quizzes

Cada pregunta tiene una única mejor respuesta, normalmente cuatro opciones, fuente, dificultad, tema, learningObjective y explicación correcta/distractores si aportan. Debe soportarse por fuente, usar distractores plausibles/conceptualmente relacionados, evitar absurdos, dobles negaciones, pistas gramaticales, respuesta correcta sistemáticamente más larga, “todas las anteriores” sin justificación y frase fuente literal frente a opciones inventadas. La dificultad procede del razonamiento, no del copy confuso. Quiz Nivel 1 selecciona solo `level == 1` y track compatible: distractor, explicación o feedback tampoco introduce Nivel 2/3. Feedback Nivel 1 es conciso; Nivel 2 puede profundizar; Nivel 3 es detallado. “Ver más detalle” revela apoyo sin ampliar scope.

`QuestionOption`: `idle`, `hover`, `focus`, `selected`, `submitted-correct`, `submitted-incorrect`, `disabled`. Antes de enviar no revela corrección; después conserva elección y correcta mediante icono+texto, no solo color. Validación de esquema y revisión humana obligatorias.

### 12.4 Casos

Flujo: hechos, problema, información faltante, figura aplicable, análisis y conclusión preliminar. Cada paso es verificable u abierto. Los abiertos muestran “Elementos que debías considerar” y checklist exclusivamente fuente (problema, faltantes, figura, no concluir prematuramente); no se marcan correcto/incorrecto ni inventan sentencia.

Prioridad inicial: riña/legítima defensa, tentativa vs. lesiones, captura, medida de aseguramiento y libertad condicional. En Primera entrevista se consumen después de fundamentos y Frente A; no desplazan Nivel 1 de entrevista.

### 12.5 Entrevista y STAR

Pregunta de entrevistadora -> respuesta oral -> “He respondido” -> guía opcional. Autoevaluación: `Me quedé en blanco`, `Parcial`, `Bien`. Tras guía, “¿Qué cubrí?” usa checkboxes de `keyPoints` documentados. Registra preparación/cobertura, no calidad personal.

Solo cinco historias STAR fuente: más de 200 trámites; tutela fuera de término; situación con juez; presión/términos TransUnion; trato con población privada de la libertad. Todas conservan Situación, Tarea, Acción, Resultado, Aprendizaje, competencias y usos. Son atajos cognitivos: la UI muestra “Esta historia te sirve para…” para reutilizarlas, no memorizar decenas de discursos. Las respuestas recomendadas son modelo de contenido: mostrar primero Idea que debe quedar y puntos clave; respuesta modelo completa es apoyo secundario, nunca guion literal.

“Háblame de ti” tiene módulo especial Pasado -> Presente -> Por qué este siguiente paso, practicable varias veces y sin convertirse en ensayo. Salario y disponibilidad quedan en Nivel 1: se presentan únicamente con términos respaldados por `ENTREVISTA_MD`.

### 12.6 Simulacro

Perfiles: `quick` (~10 min, 6-8 preguntas: presentación, motivación, experiencia, difícil/STAR y 2-3 Penal esenciales); `standard` (~20-30 min, default para Primera entrevista, 60-70% personal/profesional/situacional y 30-40% Penal/casos); `full` (profundización y mayor técnico). Son perfiles de entrenamiento, no predicción del entrevistador. Guarda orden y evita repetición excesiva.

Resultado separado: Conocimiento Penal (porcentaje), Casos (elementos identificados/esperados), Preparación de entrevista (puntos clave practicados/posibles) y Errores prioritarios. Índice de preparación opcional explicado; prohibida una única nota engañosa.

### 12.7 Mis errores y repaso rápido

Tipos: error de conocimiento, error de aplicación, duda de flashcard, concepto omitido en caso, entrevista no practicada. Cada registro tiene recurso, tema, respuesta, explicación, intentos, aciertos posteriores, fecha y estado. Acertar una vez no borra.

**Repaso antes de salir** reemplaza la formulación genérica de repaso 15 min y es central: 3-5 preguntas personales difíciles, dos STAR, 3-5 Penal esenciales, errores críticos recientes, salario, disponibilidad y 2-3 preguntas al despacho. No contiene temas nuevos, Nivel 3, artículos complejos ni casos extensos. El acceso directo Preguntas difíciles y la colección Top 10 - Primera entrevista aparecen en Home, Entrevista y este repaso sin duplicar recursos.

## 13. Algoritmos V1

### 13.1 Dominio

| Estado | Regla |
|---|---|
| No iniciado | Sin interacción significativa. |
| Aprendiendo | Lección estudiada o primera recuperación. |
| Necesita repaso | Error reciente, flashcard No la sabía, quiz temático <80% o error recurrente activo. |
| Dominado | Lección estudiada; dos recuperaciones correctas en intentos separados; quiz >=80%; sin error recurrente activo. |

Fallo posterior a dominio => Necesita repaso. Abrir pantalla nunca domina.

### 13.2 Flashcards

No la sabía: reaparece si es posible en sesión y alta prioridad siguiente. Dudé: prioridad media, antes de La sabía. La sabía: baja, nunca desaparece. Con fecha objetivo cercana, errores/dudas prevalecen sobre intervalos largos.

### 13.3 Recomendación

Prioridad: Nivel 1 entrevista no practicada; entrevista Nivel 1 en blanco/parcial; error crítico Nivel 1; cross-track crítico; Penal Nivel 1 no dominado; duda Nivel 1; sesión esencial inconclusa; Nivel 2 relevante; Nivel 3 solo con dominio y tiempo. Considera `estimatedMinutes`. Debe explicar “Te recomendamos esto porque…” con causa concreta y permitir ignorarla.

Para entrevista Nivel 1, prioridad interna: En blanco -> Parcial -> Sin practicar -> Bien no consolidada -> Consolidada. Una respuesta queda **consolidada** si se practicó al menos dos veces en intentos separados, la última fue Bien, cubrió mayoría de keyPoints esenciales y no tiene interview-content-gap activo. Parcial/En blanco posterior la devuelve a repaso. Consolidada baja prioridad para abrir espacio a otros esenciales.

Se puede sugerir Nivel 2, sin bloquearlo manualmente, cuando aproximadamente 80% de LO Nivel 1 tenga evidencia suficiente, no haya gaps críticos, Top 10 esté cubierto y Penal esencial tenga cobertura razonable: “Ya cubriste gran parte de lo esencial. Si tienes tiempo, puedes profundizar.” Los porcentajes se redondean a enteros; entrevista prefiere contadores (8/10 practicadas, 6 bien, 2 por reforzar).

## 14. Progreso y target de entrevista

Indicadores principales: **Core Readiness - Entrevista**, calculado solo con Nivel 1 Entrevista; y **Core Readiness - Penal**, calculado solo con Nivel 1 Penal. Extended Readiness usa Nivel 1+2; Depth usa Nivel 3. Nivel 3 y Referencia nunca reducen Core Readiness ni se usan como denominador.

Índice general opcional, secundario en modo Primera entrevista: 65% entrevista personal/profesional y 35% Penal técnico. Es estrategia de tiempo/prioridad, no pronóstico de preguntas. Se calcula con evidencia, no visitas, se desglosa objetivo/personal y se versiona; cambios requieren Decision Log.

```text
targetInterview: { enabled, date, time?, title, location?, focus }
```

Solo mostrar “Mañana es tu entrevista” si fecha configurada lo permite. Tras la fecha, seguir usable.

## 15. Persistencia, sesión y resiliencia

Persistir progreso, respuestas, errores, flashcards, dominio, simulacros, preferencias, `lastActivity`, `lastResourceId`, `lastMode` y posición útil. Estado activo: `sessionId`, `mode`, `resourceIds`, `currentIndex`, `answers`, `startedAt`, `completedAt`, `status`. Recarga continúa el mismo simulacro/quiz.

Separar `schemaVersion`, `contentVersion` y versión de progreso. Migraciones conservan progreso con IDs compatibles. Se prohíbe `localStorage.clear()` como actualización. Datos corruptos no rompen la app; conservar copia recuperable cuando sea razonable. Reset con confirmación. Export/import JSON P1 valida antes de reemplazar.

## 16. Modelo de datos

Separar contenido, lógica de dominio, UI y estado. Todo recurso estudiable exige: `id`, `type`, `title`, `topic`, `subtopic`, `track`, `level`, `priority`, `estimatedMinutes`, `interviewStageRelevance`, `learningObjectiveId`, `difficulty`, `sourceId`, `sourceSection`, `sourceAnchor`, `sourceExcerptHash`, `contentVersion`, `reviewStatus`, `tags`.

`reviewStatus`: `verified` se presenta como conocimiento definitivo; `needs-review` solo interno; `blocked` nunca se estudia. Pregunta: `question/options/correctAnswer/explanation/wrongAnswerExplanations`. Entrevista: `recommendedAnswer/keyPoints/avoid/relatedSTARStory`. STAR: campos situacionales completos.

Pregunta define `questionScope: { track, level, objectiveId }`; sesión añade `maxLevel`, `allowedObjectiveIds`, `timeBudget`, `newQuestionBudget`, `reviewQuestionBudget`. Gaps: `knowledge-gap`, `application-gap`, `recall-gap`, `interview-expression-gap`, `interview-content-gap`. Conocimiento correcto + autoevaluación Parcial/En blanco recomienda practicar respuesta, no teoría automática. Mis errores ordena crítico/Nivel 1, luego Nivel 2; Nivel 3 solo si se elige profundizar.

## 17. Trazabilidad y audit mode

Todo recurso resuelve **recurso -> explicación -> fragmento exacto** con `sourceId/sourceSection/sourceAnchor/sourceExcerptHash`. El hash es SHA-256 de fragmento normalizado por regla documentada durante curaduría. `sourceExcerpt` puede guardarse internamente si evita ambigüedad sin duplicación innecesaria.

UI normal: “Fuente de estudio” con título/sección. P1 Audit mode local: resource ID, source ID, section, anchor, version, verification status. Recurso sin fuente válida queda blocked.

## 18. Design system

Dirección: legal contemporáneo + producto digital premium + concentración. Sobrio, inteligente, calmado y confiable. Prohibidos clichés jurídicos, neón, gradientes decorativos, glassmorphism excesivo y SaaS genérico.

### 18.1 Foundations

Roles de color: `background`, `surface-1`, `surface-2`, `surface-3`, `text-primary`, `text-secondary`, `text-muted`, `outline`, `primary`, `primary-hover`, `primary-active`, `success`, `warning`, `error`, `info`, `focus-ring`. Light/dark mapean roles equivalentes: neutros premium + acento sobrio; no 20 colores, blanco/negro puros dominantes ni gradientes decorativos.

Spacing: 4/8 micro; 12/16 relacionados; 24 padding desktop común; 32 bloques; 48/64 macro. Retícula: sidebar fija desktop, max-width razonable, grid adaptable, ancho de lectura controlado, dashboard más ancho, padding móvil consistente.

Tipografía: Geist empaquetada localmente si es posible; fallback `system-ui, -apple-system, Segoe UI, sans-serif`; jamás Google Fonts CDN. Roles Display, H1, H2, H3, Title, Body, Body Small, Label, Caption. Lectura larga: ~65-75 caracteres/línea.

### 18.2 Componentes y composición

Biblioteca: AppShell, Sidebar, MobileNavigation, TopBar, Breadcrumb, Button, IconButton, Card, TopicCard, ContinueCard, StatCard, ProgressBar, ProgressRing, StatusBadge, SearchDialog/CommandPalette, Flashcard, QuestionOption, QuestionFeedback, QuizProgress, CaseStep, InterviewPrompt, STARCard, ErrorItem, ResultSummary, TopicMastery, Modal, Tooltip, Toast, EmptyState, Skeleton.

Cards: base, interactive, selected, emphasis, feedback-success, feedback-error; superficie, espacio, contraste y elevación leve, no bordes/sombras grandes. Botones: Primary, Secondary, Tertiary, Danger, Icon; default/hover/pressed/focus-visible/disabled/loading; una acción dominante y targets >=44px, ~48 móvil.

Cada bloque sigue “1 foco + 1 soporte”, macro/micro whitespace, proximidad y ritmo. Validar squint test y escala de grises. Dark/light: system/light/dark; default system, persistido y no improvisado.

Motion 100-250ms; flip breve opcional; reduced-motion sustituye por cambio inmediato. No anima información esencial ni usa confeti.

## 19. UX requirements

Eficacia, eficiencia y satisfacción son resultados de usabilidad. Aplicar Jakob (patrones familiares), Fitts (targets grandes/próximos), Hick (menos opciones/CTA), carga cognitiva baja, chunking, reconocimiento sobre recuerdo, visibilidad de estado, consistencia, prevención/recuperación, feedback, progressive disclosure, continuidad de contexto, responsive/adaptive design y microinteracciones informativas.

HEART/Task Success son referencia conceptual local, no telemetría externa. Éxitos: Continuar llega desde Home al pendiente en <=1 acción principal; Repasar error permite explicación/reintento sin buscar manualmente; Entrevista exige intento antes de ayuda; Repaso rápido empieza desde Home en una acción. “Tengo 20 minutos”: en una interacción selecciona tiempo y recibe sesión que cabe aproximadamente. “No sé qué estudiar”: Home muestra recomendación única y explicable. “Primera entrevista”: llega a Nivel 1 profesional sin recorrer Penal avanzado. “Reforzar Penal”: Penal esencial aparece antes de corpus completo. “Es mañana”: prioriza recall, no expansión.

## 20. Accesibilidad y responsive

WCAG 2.2 AA para P0. Texto normal >=4.5:1; grande >=3:1 cuando aplique; componentes/gráficos >=3:1 cuando corresponda. Foco visible; no retirar outline sin equivalente. Teclado completa P0; zoom 200% usable. Semántica, labels, botones reales, lector de pantalla, reflow, target táctil, estados no cromáticos y reduced motion obligatorios.

Desktop sidebar+principal; tablet adaptativa; móvil a una mano y sin scroll horizontal. Validar mobile pequeño, mobile normal, tablet, desktop y desktop ancho.

## 21. Búsqueda, performance y carga

Búsqueda indexa títulos, conceptos, tags, preguntas, casos, entrevista y STAR. Ignora mayúsculas/tildes cuando convenga: habeas encuentra hábeas corpus. Agrupa resultados; máximo inicial y Ver más; teclado ↑ ↓ Enter Esc.

Objetivo: primera carga rápida, navegación perceptualmente inmediata, bundle mínimo, lazy loading útil, no renderizar corpus completo sin necesidad, búsqueda rápida y guardado sin bloquear UI. Sin microoptimización prematura.

## 22. Plan de pruebas

Unitarias: scoring por objetivo, dominio, scheduler, recomendaciones, migraciones, normalización búsqueda, scope y blueprints. Contenido: IDs únicos, fuente existente, objetivo existente, nivel pregunta=objetivo, respuesta válida, opciones únicas, campos requeridos, anchor válido; Nivel 1 no referencia objetivo superior; feedback superior queda tras Ver más. Validar que QuizBlueprint/sesión no salga de scope/maxLevel.

Componentes: QuestionOption, Flashcard, navegación, feedback por profundidad, tema. E2E: continuar, quiz, fallar, Mis errores, corregir, reload, entrevista, simulacro, Repaso antes de salir; Nivel 1 no muestra Nivel 2/3; 10 minutos produce pocas actividades Nivel 1; Nivel 1 dominado ofrece Nivel 2 opcional; error Nivel 3 no desplaza Nivel 1; día de entrevista usa Nivel 1/cross-track; comprobación inmediata de imputación/acusación evalúa su objetivo. Accesibilidad: teclado, foco, contraste, reduced motion, labels, axe/equivalente. Responsive: cinco tamaños definidos.

Auditoría visual por pantalla: squint, escala grises, contraste, jerarquía, alineación, spacing, densidad, radios, elevación, estados, light, dark, mobile. Funcional pero wireframe no está terminado.

Regla de implementación futura: construir vertical slices usables, no todo el sistema ni todo el corpus primero. Slice 1: Home -> primera actividad -> práctica -> guardar progreso. Slice 2: Entrevista Nivel 1. Slice 3: Penal Nivel 1 + quiz. Slice 4: errores + recomendaciones. Slice 5: Repaso antes de salir. Slice 6: simulacros/Nivel 2+. Cada slice debe funcionar antes de ampliar.

## 23. Prioridades

| Entrega | Alcance |
|---|---|
| **P0-A - usable lo antes posible** | Home priorizada, Plan de hoy, selector 10/20/30/60, Nivel 1 Entrevista/Penal/cross-track, LearningObjectives y Coverage Matrix de Nivel 1, bancos y práctica Nivel 1, flashcards, prompts orales, STAR, errores, progreso esencial/Question Readiness, Repaso antes de salir, persistencia y responsive básico. Banco inicial: cada LO Penal 2-4 preguntas útiles máximo; cada prompt de entrevista, prompt oral y máximo 1-2 follow-ups fuente. |
| **P0-B - tras P0-A usable** | Nivel 2/3, casos ampliados, búsqueda completa, simulacro Standard mejorado, las capacidades P0 complementarias ya previstas y mayor cobertura de corpus. No retrasan P0-A. |
| P1 | Export/import JSON, estadísticas/filtros/recomendación avanzada, personalización secundaria, Audit mode, simulacro full. |
| P2 | Cuentas, nube, sincronización, voz, audio avanzado, IA y multiusuario. |

Regla: no retrasar una versión usable de estudio por completar contenido avanzado, Nivel 2/3 o Referencia.

## 24. Criterios de aceptación

- [ ] Cada recurso visible está verified, trazable a fragmento y no inventa contenido.
- [ ] Corpus completo estructurado y priorizado; lecciones digeribles.
- [ ] Quiz enseña; errores reaparecen; entrevista no recibe calificación falsa; casos abiertos no fingen sentencia.
- [ ] Simulacro separa conocimiento, casos, entrevista y errores.
- [ ] Home/Navegación/continuidad cumplen escritorio y móvil.
- [ ] Dominio, flashcards, recomendación y repaso siguen V1 determinista.
- [ ] Sin IA, telemetría ni dependencia runtime remota.
- [ ] Persistencia versionada, recuperable y sin clear masivo.
- [ ] Tokens, contraste, foco, teclado, zoom, reduced motion y responsive cumplen.
- [ ] Plan de pruebas, auditoría visual y auditoría contenido superados.
- [ ] Home indica qué estudiar sin explorar corpus; Nivel 1 se distingue; Nivel 3 no afecta Core Readiness.
- [ ] Puede estudiarse 10 minutos útilmente y sesión no excede el tiempo elegido.
- [ ] Preguntas difíciles, Top 10 y Penal esencial tienen acceso directo; avanzado sigue disponible sin ser deuda.
- [ ] Día de entrevista prioriza recall; STAR evita memorizar respuestas independientes; respuestas modelo no parecen guiones obligatorios.
- [ ] Errores esenciales desplazan avanzados; no aparece “47 temas pendientes”; puede cerrar una sesión esencial.
- [ ] Cada pregunta tiene LearningObjective; cada objetivo tiene nivel y matriz de cobertura.
- [ ] Study/Practice comparten scope; Nivel 1 no recibe preguntas, distractores o feedback Nivel 2/3.
- [ ] El banco completo no se usa indiscriminadamente; score es por objetivo, no conteo de preguntas.
- [ ] Quick es Nivel 1; Standard respeta máximo estudiado; Repaso antes de salir es Nivel 1/cross-track crítico.
- [ ] Entrevista Nivel 1 se practica oralmente; Top 10 y Penal esencial exponen cobertura por objetivo.
- [ ] Session Builder respeta timeBudget/maxLevel; profundizar requiere elección explícita.
- [ ] P0-A permite abrir, empezar con “Háblame de ti”, practicar Nivel 1 y conservar progreso sin esperar Nivel 2/3.
- [ ] Respuesta de entrevista consolidada reduce prioridad; nivel 2 se sugiere solo con umbral esencial suficiente.
- [ ] Progreso móvil/PC declara claramente independencia cuando no existe sincronización.

## 25. No objetivos

No: página MD larga, dashboard saturado, exceso de color/bordes, gamificación infantil, confeti, preguntas triviales/sin explicación, IA jurídica libre, navegación experimental, fuentes extravagantes, botones pequeños, animación decorativa, backend innecesario, sobreingeniería, recursos web remotos, countdown dramático, urgencia artificial o total del corpus presentado como deuda.

## 26. Protocolo de auditoría

Clasificar hallazgos: CRÍTICO, IMPORTANTE, MEJORA, NICE TO HAVE. Auditar contenido, UX, UI, aprendizaje, accesibilidad, responsive, performance, privacidad y calidad técnica. Corrección cita requisito, conserva fuente y actualiza Decision Log si cambia comportamiento.

## 27. Registro de decisiones

| Fecha | Decisión | Motivo | Impacto | Estado |
|---|---|---|---|---|
| 2026-09-20 | Raíz autocontenida y cuatro fuentes copiadas | Portabilidad/auditoría | Rutas relativas y hashes | PROPOSED |
| 2026-09-20 | Incorporar UX.pdf y UI.pdf leídos | Criterios reales de UX/UI | Requisitos verificables | PROPOSED |
| 2026-09-20 | P0 incluye casos, simulacro, búsqueda y repaso rápido | Entrevista inmediata | MVP pedagógico completo | PROPOSED |
| 2026-09-20 | Separar objetivo/personal | Evitar nota engañosa | Resultados diferenciados | PROPOSED |
| 2026-09-20 | Dominio/flashcards V1 deterministas | Cerrar ambigüedad | Reglas pedagógicas | PROPOSED |
| 2026-09-20 | Privacidad local-first y offline runtime | Datos profesionales personales | Sin IA/telemetría/red | PROPOSED |
| 2026-09-20 | Cero generación jurídica runtime | Control de calidad | Corpus curado/versionado | PROPOSED |
| 2026-09-20 | Testing y auditoría visual obligatorios | Calidad verificable | Cobertura P0 | PROPOSED |
| 2026-09-20 | Estrategia de entrevista inmediata y dos frentes | Tiempo disponible limitado | Entrevista prioritaria; Penal esencial obligatorio | PROPOSED |
| 2026-09-20 | Niveles 1/2/3/Referencia y Core separado de Depth | Evitar sesgo de completitud | Ruta activa corta; avanzado sin deuda | PROPOSED |
| 2026-09-20 | Plan de hoy y selector de tiempo | Reducir indecisión y sobrecarga | Sesiones deterministas compatibles con tiempo | PROPOSED |
| 2026-09-20 | Día de entrevista y Repaso antes de salir | Favorecer recall previo a salida | No expansión masiva el mismo día | PROPOSED |
| 2026-09-20 | Primera entrevista como default; Penal esencial y Top 10 | Priorizar trayectoria y fundamentos | Simulacro standard 60-70% profesional | PROPOSED |
| 2026-09-20 | STAR como recuperación y nuevos gaps | Diferenciar hablar de desconocer | Recomendación de práctica vs teoría | PROPOSED |
| 2026-09-20 | Stop rule | No empujar contenido por completitud | Cierre sobrio de sesión | PROPOSED |
| 2026-09-20 | Study-Practice Alignment | Evitar evaluar capas no estudiadas | Scope común de lección, práctica y repaso | PROPOSED |
| 2026-09-20 | LearningObjectives y Coverage Matrix | Auditar estudio=práctica | Recursos mapeados a metas y fuente | PROPOSED |
| 2026-09-20 | Bancos por nivel y scoring por objetivo | Evitar banco indiscriminado y peso por cantidad | Cobertura equilibrada por meta | PROPOSED |
| 2026-09-20 | Question budget, blueprints y maxLevel | Sesiones breves sin sorpresas | Builder limitado por tiempo/scope | PROPOSED |
| 2026-09-20 | Entrevista oral y MCQ principalmente técnico | Entrenar la conducta real | Prompts orales antes de modelo | PROPOSED |
| 2026-09-20 | Feedback progresivo y repaso por capa | Evitar sobrecarga de doctrina | Nivel 1 conciso; detalle opcional | PROPOSED |
| 2026-09-20 | Mapa explícito de LearningObjectives Nivel 1 | Cerrar prioridad sin inferencia futura | Secuencia Entrevista antes de Penal | PROPOSED |
| 2026-09-20 | Entregas P0-A/P0-B y banco inicial limitado | Llegar a una herramienta usable hoy | Avanzado no bloquea Nivel 1 | PROPOSED |
| 2026-09-20 | Consolidación específica de entrevista | No sobrepracticar respuestas ya sólidas | Prioridad por En blanco/Parcial | PROPOSED |
| 2026-09-20 | Plantillas de sesión y primer uso definidos | Eliminar decisiones de ejecución | Inicio inmediato con Háblame de ti | PROPOSED |
| 2026-09-20 | Progreso independiente por navegador | Local-first sin promesa de sincronización | PC y móvil pueden diferir | PROPOSED |

## 28. Implementation Readiness: READY FOR USER APPROVAL

- [x] Cuatro fuentes copiadas, leídas y registradas.
- [x] Hashes registrados.
- [x] Arquitectura, P0, dominio V1, autoevaluación, casos, simulacro, navegación y foundations definidos.
- [x] Privacidad, persistencia, trazabilidad, pruebas y aceptación definidos.
- [x] Niveles, contenido esencial, Primera entrevista, Plan de hoy, selector de tiempo y Core Readiness definidos.
- [x] Simulacros quick/standard/full, modo día de entrevista, gaps de entrevista y stop rule definidos.
- [x] LearningObjective, Coverage Matrix, question scope/budget, blueprints, maxLevel y score por objetivos definidos.
- [x] Reglas de preguntas por nivel y validaciones de scope definidas.
- [x] Ninguna decisión crítica de diseño pendiente.
- [ ] Aprobación expresa de este contrato por la usuaria.

Hasta aprobación expresa, estado: **FINAL DRAFT — PENDIENTE DE APROBACIÓN**.

## 29. Preguntas pendientes

No hay decisiones críticas pendientes de definición. Falta únicamente la aprobación expresa de este borrador antes de implementación.

## 30. Definición de terminado

La primera versión solo termina si funciona, es usable, enseña, conserva progreso, corrige errores, mantiene trazabilidad, responde en móvil/desktop, cumple design system, respeta fuentes, protege privacidad y puede auditarse. También debe priorizar: no está bien diseñada si contiene todo pero Valentina pierde 30 minutos decidiendo qué estudiar.

**“El MVP cumple su propósito si Valentina puede abrir la aplicación hoy y, sin decidir manualmente entre decenas de temas, empezar inmediatamente a practicar lo más importante para su entrevista.”**

Compilar o verse bonita no basta.

---

**Cierre:** este contrato no autoriza crear la aplicación, instalar dependencias, inicializar proyecto ni generar JSON hasta aprobación expresa.

# Apéndice A. Mapa de contenido prioritario - LearningObjectives Nivel 1

Secuencia por defecto: empezar con Entrevista esencial y experiencia real; intercalar Penal tras los primeros objetivos de entrevista. Fuente abreviada: `ENT` = `ENTREVISTA_MD`; `PEN` = `PENAL_MD`. Los tiempos son buckets de planificación, no cronómetros.

## A. Entrevista esencial

| ID | Título | Orden | Fuente | Práctica | Tiempo |
|---|---|---:|---|---|---:|
| LO-INT-001 | Háblame de ti: pasado-presente-siguiente paso | 1 | ENT §3 | Oral + key points | 5m |
| LO-INT-002 | Explicar por qué Derecho Penal | 2 | ENT §4 | Oral | 5m |
| LO-INT-003 | Explicar experiencia penal real | 3 | ENT §5 | Oral cross-track | 5m |
| LO-INT-004 | Decir con precisión qué no ha hecho en litigio | 4 | ENT §6 | Oral + follow-up | 5m |
| LO-INT-005 | Explicar salida de TransUnion sin negatividad | 5 | ENT §7 | Oral | 5m |
| LO-INT-006 | Contar error profesional y aprendizaje | 6 | ENT §14 | STAR oral | 5m |
| LO-INT-007 | Explicar presión y términos | 7 | ENT §16, §18 | Oral | 5m |
| LO-INT-008 | Comunicar brecha/debilidad con honestidad | 8 | ENT §13 | Oral | 5m |
| LO-INT-009 | Explicar por qué contratarla | 9 | ENT §11 | Oral | 5m |
| LO-INT-010 | Responder salario y disponibilidad | 10 | ENT §34-36 | Oral | 5m |
| LO-INT-011 | Explicar contratos temporales y juzgados | 11 | ENT §8-10 | Oral | 5m |
| LO-INT-012 | Recuperar STAR esenciales | 12 | ENT §42 | STAR oral | 10m |

## B. Penal esencial

| ID | Título | Orden | Fuente | Práctica | Tiempo |
|---|---|---:|---|---|---:|
| LO-PEN-001 | Explicar experiencia propia en ejecución de penas | 1 | PEN §39, §43-44, §55 | Oral cross-track | 5m |
| LO-PEN-002 | Definir conducta punible | 2 | PEN §3 | Flashcard + recall | 2m |
| LO-PEN-003 | Distinguir tipicidad, antijuridicidad y culpabilidad | 3 | PEN §3, §54 | Distinción + quiz | 5m |
| LO-PEN-004 | Distinguir dolo y culpa | 4 | PEN §5, §54 | Recall + aplicación breve | 5m |
| LO-PEN-005 | Explicar tentativa | 5 | PEN §7, §54 | Recall + aplicación | 5m |
| LO-PEN-006 | Distinguir autor, coautor y cómplice | 6 | PEN §8, §54 | Distinción | 5m |
| LO-PEN-007 | Recordar mapa básico del proceso | 7 | PEN §12 | Recall ordenado | 5m |
| LO-PEN-008 | Distinguir juez de garantías y conocimiento | 8 | PEN §15 | Distinción | 5m |
| LO-PEN-009 | Analizar captura y flagrancia básica | 9 | PEN §16-17 | Quiz/aplicación | 5m |
| LO-PEN-010 | Distinguir imputación y acusación | 10 | PEN §18-19, §54 | Flashcard + quiz | 5m |
| LO-PEN-011 | Explicar medida de aseguramiento | 11 | PEN §21, §38 | Recall + aplicación | 5m |
| LO-PEN-012 | Explicar teoría del caso | 12 | PEN §25, §54 | Recall | 2m |
| LO-PEN-013 | Identificar estándar de condena | 13 | PEN §31, §54 | Recall | 2m |
| LO-PEN-014 | Explicar hábeas corpus | 14 | PEN §37, §54 | Recall/oral | 5m |
| LO-PEN-015 | Explicar juez de ejecución de penas | 15 | PEN §39, §54 | Oral | 5m |
| LO-PEN-016 | Explicar libertad condicional y redención conceptual | 16 | PEN §42-43 | Distinción | 5m |
| LO-PEN-017 | Razonar respuesta técnica no recordada | 17 | PEN §48, §57; ENT §44-45 | Oral cross-track | 5m |

## C. Cross-track

| ID | Título | Orden relativo | Fuente | Práctica | Tiempo |
|---|---|---:|---|---|---:|
| LO-X-001 | Conectar experiencia de ejecución con candidatura Penal sin exagerar litigio | Intercalar tras INT-003 | ENT §5-6, §32-33; PEN §39, §55-56 | Oral + follow-up | 5m |
| LO-X-002 | Explicar hábeas corpus desde experiencia y concepto | Intercalar con PEN-014 | ENT §3, §5; PEN §37 | Oral + recall | 5m |
| LO-X-003 | Responder una pregunta técnica sin inventar artículo | Intercalar tras PEN-010 | ENT §21, §44-45; PEN §57 | Oral guiada | 5m |

El futuro agente debe implementar primero estos LO y su Coverage Matrix P0-A; Nivel 2/3/Referencia no son requisito previo para que Valentina estudie.
