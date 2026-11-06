# Beep Gamer

Armá partidas con tu Squad en segundos. Next.js + Supabase + Web Push.

## Puesta en marcha

1. `npm install`
2. Copiá `.env.example` a `.env.local` y completá las claves.
   Las claves VAPID se generan con `npx web-push generate-vapid-keys`.
3. Ejecutá `supabase/schema.sql` en el SQL Editor de Supabase.
4. En Supabase, activá Realtime para la tabla `beep_responses`.
5. `npm run dev`

## Estructura

- `app/` páginas y API routes (`/api/beeps`, `/api/vapid-public-key`)
- `components/` BeepTrigger, BeepFeed, ContactFilter
- `lib/` cliente Supabase y helpers de notificaciones push
- `public/sw.js` Service Worker
- `supabase/schema.sql` esquema de base de datos
