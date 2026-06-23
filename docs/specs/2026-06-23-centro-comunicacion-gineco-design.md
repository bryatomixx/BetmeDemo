# Centro de Comunicación — Hospital Centro Ginecológico (Demo)

Fecha: 2026-06-23
Estado: Aprobado (Opción A)

## 1. Contexto

Demo realista (datos simulados, sin APIs reales) para el **Hospital Centro Ginecológico** de El Salvador (San Salvador, Colonia Médica, fundado 1964). El cliente real es un hospital de ginecología, obstetricia y pediatría.

Objetivo del producto: un **command center omnicanal interno** que unifica en una sola bandeja ordenada (a) la comunicación con pacientes por WhatsApp, Instagram y Facebook, y (b) la comunicación interna entre departamentos del hospital.

Marca real verificada desde centroginecologico.com.sv:

| Elemento | Valor |
|---|---|
| Azul primario | `#0067f8` |
| Verde acento | `#4ac12f` |
| Base | Blanco `#ffffff` |
| Tagline | "Somos parte de tu vida" |
| Logo | wordmark azul horizontal |
| Redes | facebook.com/hospitalcentroginecologico · instagram.com/hospitalcentroginecologico |
| Especialidades | Ginecología, Obstetricia, Pediatría, Reproducción asistida, Imágenes, Laboratorio, Emergencias 24h |

## 2. Alcance (Opción A: profundidad en la bandeja)

**Dentro del alcance:**
1. **Bandeja unificada** — WhatsApp + Instagram DM + Facebook Messenger en una sola lista, ordenada por canal (tabs), estado (Nuevo / En progreso / Resuelto), asignación (Mías / Sin asignar / Todas) y departamento.
2. **Chat interno** — canales por departamento + mensajes directos entre staff, con sensación de tiempo real.
3. **Redes sociales** — los DMs entran a la bandeja; módulo ligero para ver/programar publicaciones (rol Admin/Marketing).
4. **Dashboard** — métricas: volumen, tiempo de respuesta, conversaciones por departamento, % resueltas.
5. **Roles** — selector de rol demo (Recepción, Médico, Jefe de departamento, Admin/Marketing) que cambia lo que se ve. **Sin llamadas**, solo mensajería.

**Fuera del alcance (YAGNI para el demo):**
- Integración real con WhatsApp Business API / Meta (solo costura FAKE/REAL).
- Expedientes clínicos, camas, farmacia, facturación.
- Autenticación real / multi-tenant.
- Backend / base de datos real (capa de datos mock en memoria).
- Llamadas de voz / telefonía.

## 3. Stack

Igual a los demos recientes del workspace:
- Next.js 16.2.1 (App Router), React 19.2.4, TypeScript, Tailwind v4 (`@tailwindcss/postcss`).
- `lucide-react` (iconos), `clsx` + `tailwind-merge` (clases), `framer-motion` (animaciones sutiles del "live").
- Datos: capa mock en memoria detrás de una interfaz de proveedor (impl FAKE ahora; REAL después).
- Puerto 3000. Dev server vía PowerShell `Start-Process` (el shim de npm falla en Windows en background, según memoria del workspace).

> Nota crítica: este Next 16 del workspace tiene breaking changes respecto al Next conocido. **Leer `node_modules/next/dist/docs/` antes de escribir código Next** (instrucción de AGENTS.md).

## 4. Arquitectura

### Capa de datos (`lib/data/`)
- `types.ts` — modelos: `Channel` (`whatsapp|instagram|facebook|internal`), `ConversationStatus` (`nuevo|en_progreso|resuelto`), `Department`, `Role`, `Contact` (paciente), `StaffUser`, `Conversation`, `Message`, `InternalChannel`, `SocialPost`, `Metric`.
- `seed.ts` — datos semilla realistas (ver §5).
- `provider.ts` — interfaz `CommsProvider` con impl `FakeCommsProvider`. Métodos: `listConversations`, `getConversation`, `sendMessage`, `assignConversation`, `setStatus`, `listInternalChannels`, `sendInternalMessage`, `listSocialPosts`, `getMetrics`. La costura REAL futura implementa la misma interfaz contra Meta Cloud API.
- `live-engine.ts` — inyecta mensajes entrantes simulados periódicamente (client-side `setInterval`) para dar sensación de vida; respeta "pausar" y limpieza al desmontar.

### Estado de cliente
- `lib/store.tsx` — React Context + `useReducer` que envuelve el provider y notifica cambios. Acciones: responder, asignar, cambiar estado, marcar leído, enviar interno. El live-engine despacha acciones de "mensaje entrante".

### Roles (`lib/roles.ts`)
- Definición de roles y permisos (qué módulos/vistas ve cada rol). Rol activo persistido en `localStorage`. El selector de rol es un control de demo visible en el sidebar.

### UI / Rutas (App Router)
- **Layout principal**: sidebar persistente (navegación + rol + identidad de marca + tagline).
- `/` → Bandeja unificada: 3 columnas — lista de conversaciones · hilo · panel de contexto del paciente. Tabs por canal + filtros por estado/asignación/departamento.
- `/interno` → Chat interno: lista de canales/DMs · hilo.
- `/redes` → Publicaciones (Admin/Marketing): lista/calendario simple + composer mock.
- `/dashboard` → Métricas.
- Componentes compartidos: `Sidebar`, `RoleSwitcher`, `ChannelBadge`, `StatusPill`, `Avatar`, `ConversationListItem`, `MessageBubble`, `Composer`, `ContextPanel`, `MetricCard`.

### Branding
- Tokens en `globals.css`: `--brand-blue: #0067f8`, `--brand-green: #4ac12f`. Wordmark propio "Centro Ginecológico" en azul (no se reutiliza el SVG original con copyright). Tagline "Somos parte de tu vida" en sidebar.

### Flujo de datos
Provider (fake, en memoria) → store (context) → componentes. Las acciones (responder, asignar, cambiar estado) mutan el store y re-renderizan. El live-engine empuja nuevos mensajes al store.

### Manejo de errores (nivel demo)
Estados vacíos (sin conversaciones), skeletons de carga, validación básica del composer (no enviar vacío). Sin manejo de red (es mock).

## 5. Realismo de datos (semilla)

- **Departamentos**: Ginecología, Obstetricia, Pediatría, Reproducción Asistida, Laboratorio, Imágenes, Recepción.
- **Staff** de ejemplo por departamento (con nombres y roles salvadoreños).
- **~12-15 conversaciones** de pacientes en español salvadoreño, repartidas entre WhatsApp/IG/FB y estados: agendar control prenatal, resultados de laboratorio, dudas de pediatría, costos de ultrasonido, citas de reproducción asistida, horarios de emergencia, etc.
- **Canales internos**: `#general`, `#ginecologia`, `#pediatria`, `#laboratorio`, `#emergencias`, + algunos DMs.
- **Métricas**: volumen por día, tiempo de respuesta promedio, conversaciones por departamento, % resueltas.

## 6. Testing

Ligero y enfocado en la lógica: `vitest` sobre el provider y el reducer (acciones de asignación / cambio de estado / envío). La UI de un demo no se testea exhaustivamente; la lógica (donde puede romperse) sí.

## 7. Decisiones cerradas

- Sin llamadas (solo mensajería). Confirmado.
- Bandeja unificada y ordenada. Confirmado.
- Demo realista, no producción, pero con costura FAKE/REAL para enchufar APIs reales luego. Confirmado.
- Marca real verificada (no fabricada). Confirmado.
