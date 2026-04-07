# PROCORPMDigital — Agencia de Marketing IA

## Sobre el Proyecto

Sistema multi-agente de inteligencia artificial para operaciones de marketing digital completo. Cada sub-agente especializado colabora de forma coordinada para ejecutar estrategias de marketing end-to-end.

## Principios de Arquitectura

- **Especialización**: Cada agente domina un area sin superposicion de responsabilidades
- **Orquestacion**: Un agente orquestador coordina el flujo de trabajo
- **Trazabilidad**: Cada accion y entregable queda documentado con referencia al agente que lo produjo
- **Escalabilidad**: Se pueden incorporar nuevos agentes sin redisenar la arquitectura
- **Feedback loops**: Los resultados alimentan a los agentes de investigacion para mejora continua

## Jerarquia de Agentes

| Nivel | Agente | Rol |
|-------|--------|-----|
| 0 - Director | Orquestador | Coordina todos los agentes, gestiona prioridades, reporta al cliente |
| 1 - Estrategia | Investigador | Analiza mercados, competencia y tendencias |
| 1 - Estrategia | Estratega de Campanas | Disena estrategias y briefings creativos |
| 2 - Produccion | Creador de Contenido | Redacta copies, blogs, emails, posts |
| 2 - Produccion | Creador de Video | Guiones, storyboards, directrices de produccion |
| 2 - Produccion | Disenador Visual | Identidad, banners, creatividades graficas |
| 3 - Tecnologia | Desarrollador | Landing pages, integraciones, automatizaciones |
| 3 - Tecnologia | Analista de Datos | Metricas, reportes, optimizacion basada en datos |
| 4 - Operaciones | Gestor de Proyectos | Cronogramas, deadlines, control de calidad |

## Flujo de Trabajo Estandar

1. Cliente entrega brief → Orquestador analiza y asigna tareas
2. Investigador recopila datos de mercado y audiencia objetivo
3. Estratega disena la campana y produce el briefing creativo
4. Agentes de Produccion (Contenido, Video, Diseno) ejecutan entregables
5. Desarrollador implementa tecnologia necesaria (landing, automatizacion)
6. Analista de Datos mide resultados y genera reportes
7. Orquestador consolida, revisa calidad y entrega al cliente

## Estructura de Carpetas

```
agents/                  # Configuracion y prompts de cada agente
  orquestador/           # Agente director (Nivel 0)
  investigador/          # Analista de mercado (Nivel 1)
  estratega/             # Arquitecto de estrategia (Nivel 1)
  contenido/             # Redactor creativo (Nivel 2)
  video/                 # Director audiovisual (Nivel 2)
  diseno/                # Especialista visual (Nivel 2)
  desarrollador/         # Ingeniero de martech (Nivel 3)
  analista/              # Especialista en metricas (Nivel 3)
  gestor-proyectos/      # Control de operaciones (Nivel 4)

config/                  # Configuracion global del sistema
  prompts/               # System prompts base
  protocols/             # Protocolos de comunicacion entre agentes

clients/                 # Carpeta por cliente con briefs y datos
campaigns/               # Campanas activas organizadas por cliente/campana

templates/               # Plantillas reutilizables
  briefs/                # Templates de briefings
  reports/               # Templates de reportes
  deliverables/          # Templates de entregables

assets/                  # Recursos compartidos
  brand/                 # Guias de marca de clientes
  media/                 # Imagenes, videos, audio
  designs/               # Archivos de diseno

data/                    # Datos e investigacion
  research/              # Informes de mercado y competencia
  analytics/             # Datos de rendimiento
  audiences/             # Buyer personas y segmentaciones

tools/                   # Herramientas e integraciones
  integrations/          # Conectores con plataformas externas
  automations/           # Flujos automatizados (n8n, Make)

output/                  # Entregables finales
  content/               # Copies, blogs, emails
  videos/                # Guiones y storyboards
  designs/               # Creatividades aprobadas
  landing-pages/         # Landing pages terminadas
```

## Protocolos de Comunicacion

### Estructura de Mensaje entre Agentes

Todo mensaje entre agentes debe incluir:
- **FROM**: Agente que envia
- **TO**: Agente destinatario
- **TASK_ID**: Identificador unico (ej: `CAMP-2024-001-T3`)
- **PRIORITY**: HIGH / MEDIUM / LOW
- **CONTEXT**: Resumen del proyecto
- **REQUEST**: Tarea especifica solicitada
- **INPUTS**: Documentos o datos adjuntos
- **DEADLINE**: Fecha y hora limite
- **OUTPUT_FORMAT**: Formato esperado del entregable

### Estados de Tarea

| Estado | Significado |
|--------|-------------|
| PENDING | Tarea asignada, no iniciada |
| IN_PROGRESS | Agente trabajando activamente |
| BLOCKED | Necesita input externo |
| REVIEW | Entregable listo para revision |
| APPROVED | Entregable aprobado |
| REJECTED | Necesita cambios |
| DONE | Completada e integrada |

## Reglas Globales

1. Cada agente debe identificarse por su nombre al inicio de cada respuesta
2. Ningun agente ejecuta tareas fuera de su area sin aprobacion del orquestador
3. Todo entregable incluye metadatos: agente, tarea, version, fecha
4. Si una tarea supera las capacidades del agente, debe notificar al orquestador
5. No compartir informacion del cliente entre proyectos distintos
6. Todos los entregables deben alinearse con el briefing creativo aprobado
7. Los agentes deben iterar sin resistencia hasta aprobacion
8. El orquestador no asigna mas de 3 tareas paralelas a un mismo sub-agente

## Herramientas por Agente

| Agente | Herramientas |
|--------|-------------|
| Investigador | SEMrush, Ahrefs, Google Trends, BuzzSumo, SimilarWeb, Perplexity AI |
| Estratega | Notion, Miro, Google Slides, ClickUp, HubSpot |
| Contenido | Claude/ChatGPT, Jasper, Copy.ai, Grammarly, Hemingway |
| Video | Runway, Pika Labs, HeyGen, Descript, CapCut, Sora |
| Diseno | Canva, Figma, Adobe Firefly, Midjourney, DALL-E, Leonardo AI |
| Desarrollador | VS Code, GitHub, Vercel, Netlify, Make/n8n, Supabase, GTM, GA4 |
| Analista | Google Analytics 4, Looker Studio, Meta Ads Manager, Power BI |
| Gestor | ClickUp, Notion, Asana, Monday, Slack, Linear |

## Convenciones

- Idioma principal: Espanol
- Nomenclatura de tareas: `{CLIENTE}-{ANO}-{NUM}-T{TAREA}` (ej: `ACME-2026-001-T3`)
- Formato de entregables: Markdown para documentos, JSON para datos estructurados
- Versionado de entregables: `v1.0`, `v1.1`, `v2.0`
