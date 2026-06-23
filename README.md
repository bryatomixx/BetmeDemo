# Centro de Comunicación — Hospital Centro Ginecológico

Demo realista de un **command center omnicanal interno** para el Hospital Centro
Ginecológico (San Salvador). Unifica en una sola bandeja ordenada la comunicación
con pacientes (WhatsApp, Instagram, Facebook) y la comunicación interna entre
departamentos del hospital.

> Demo con datos simulados. No conecta APIs reales todavía, pero está construido
> sobre una costura `FAKE`/`REAL` lista para enchufar la API de WhatsApp Business
> (Meta Cloud) y redes sin rehacer la interfaz.

## Módulos

- **Bandeja unificada** (`/`): WhatsApp + Instagram + Facebook en una sola lista,
  ordenada por canal, estado (Nuevo / En progreso / Resuelto), asignación
  (Mías / Sin asignar / Todas) y departamento. Responder, asignar y resolver en vivo.
- **Chat interno** (`/interno`): canales por departamento y mensajes directos.
- **Redes sociales** (`/redes`): programar y administrar publicaciones de FB e IG.
- **Dashboard** (`/dashboard`): métricas de volumen, tiempo de respuesta,
  conversaciones por departamento y estado.

## Detalles del demo

- **Selector de rol** (esquina inferior del sidebar): cambia entre Recepción,
  Médico, Jefe de departamento y Admin/Marketing para mostrar qué ve cada perfil.
  Sin llamadas, solo mensajería.
- **Modo en vivo** (toggle en la bandeja): inyecta mensajes entrantes simulados
  cada pocos segundos para que el inbox se sienta activo durante la demostración.
- **Marca real**: azul `#0067f8`, verde `#4ac12f`, tagline "Somos parte de tu vida".

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · lucide-react.
Estado de cliente con Context + reducer. Capa de datos en memoria detrás de la
interfaz `CommsProvider` (`lib/data/provider.ts`).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

En Windows, si el dev server en segundo plano falla (el shim de npm sale con 127),
lánzalo con PowerShell directamente sobre node:

```powershell
Start-Process node "node_modules\next\dist\bin\next dev" -WorkingDirectory (Get-Location)
```

## Pruebas

```bash
npm test
```

Cubren la lógica del proveedor de datos y el reducer del store (asignación,
cambio de estado, envío, mensajes entrantes).

## Estructura

```
app/                  rutas (bandeja, interno, redes, dashboard) + layout
components/
  shell/              sidebar, marca, selector de rol, motor en vivo
  inbox/              lista, hilo, composer, panel de contexto, filtros
  internal/           canales y hilo del chat interno
  social/             lista y composer de publicaciones
  dashboard/          tarjetas de métrica y desgloses
  ui/                 primitivas (badges, avatar, estados vacíos)
lib/
  data/               types, seed realista, FakeCommsProvider, motor en vivo
  store.tsx           Context + reducer (acciones de la bandeja)
  roles.ts            roles y permisos del demo
  format.ts           formato de fechas y lookups
```
