# Project Guidance

## User Preferences

- App name must be ग्राम पंचायत
- Hindi-first interface with English labels alongside key actions
- Villagers share problems and everyone can view village facts, figures, and development data
- Responsive layout usable on mobile and desktop
- Public contact email is Virendupadhyay.2000@gmail.com and phone is +91 94131 44022, editable by admins

## Verified Commands

- **typecheck**: `mops check --fix`
- **build**: `mops build`

## Learnings

- AccessControl.isAdmin (caffeineai-authorization) traps 'User is not registered' for unregistered/anonymous callers; guard admin endpoints with a local helper that returns false for anonymous/unregistered callers and true only for a registered #admin role.
- OQL auto-derivation needs a top-level _toRow instance for every field type: import built-in <Type>Value modules (IntValue for Int/Timestamp) and ship a custom <Type>Value.mo for each variant, option, or nested-record field type.
- Under Enhanced Migration with an empty deployed baseline and check-limit=1, the whole chain must be a single pending migration with OldActor = {}; fold earlier pending init migrations into the latest pending file.
- Tailwind v3 only generates color utilities for tokens registered in tailwind.config.js colors, and tokens used with opacity modifiers need <alpha-value> or the modifier is silently dropped.
- Mount <Toaster /> from sonner once at the app root so toast() calls in pages are not silent no-ops.
- Guard BigInt(routeParam) with a numeric regex before conversion so non-numeric params render the not-found state instead of throwing into the router error boundary.
- Motoko Time.now() is a nanosecond bigint — divide by 1_000_000n before constructing a JS Date.
- useActor(createActor) from @caffeineai/core-infrastructure returns { actor, isFetching }; gate queries on !!actor && !isFetching. useInternetIdentity exposes isAuthenticated for restored sessions.
- Contact settings live in a stable `contactSettings : { var value : ?ContactSettings }` field; getContactSettings returns defaults via `?? defaultContactSettings` so the OQL contactSettings entity always yields exactly one row.
- Footer is mounted in Layout for every route, so invalidating queryKeys.contactSettings after save refreshes the footer site-wide without extra wiring.
- AdminSettingsPage seeds its editable draft from useContactSettings once via an initialized flag so background refetches never clobber an in-progress edit.
- pnpm bindgen from the project root regenerates backend.d.ts/backend.ts/declarations from src/backend/dist/backend.did; run it after any backend API change or the frontend bindings go stale.
