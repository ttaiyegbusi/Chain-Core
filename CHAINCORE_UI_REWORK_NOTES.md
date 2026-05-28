# ChainCore UI Rework Notes

This build was reworked to follow the uploaded Align UI foundation more closely.

## What changed

- Added an Align UI inspired semantic token layer in `tailwind.config.ts`.
- Reworked global CSS foundations in `src/app/globals.css`:
  - Inter-first typography stack with bundled Geist fallback.
  - calmer page background.
  - refined focus ring.
  - reusable component utility classes for buttons, controls, cards, tables, modals and page layout.
- Updated the main shell:
  - `PrimaryRail`
  - `AccountingSidebar`
  - `GlobalHeader`
  - `AccountCategoryTabs`
- Refined shared form controls:
  - labels
  - inputs
  - selects
  - textareas
  - checkboxes
  - accordion sections
- Refined tables across accounting screens:
  - card-like table containers
  - softer borders
  - uppercase table headings
  - improved row density
  - better hover states
- Refined modal styling:
  - softer overlay
  - Align UI-style rounded panel
  - calmer shadows
  - improved input and CTA styling
- Refined Core AI visual system:
  - changed “Core Ai” to “Core AI”
  - calmer floating panel elevation
  - better header controls
  - improved composer surface
  - standardized prompt chips

## Validation

`npm run build` completed successfully.

## Important note

The project still uses `lucide-react` icons because the current codebase already depends on it. Align UI references RemixIcon, but switching icon libraries would require adding a new dependency and replacing icon imports across the app. The current pass standardizes the existing icon treatment instead of changing the library.
