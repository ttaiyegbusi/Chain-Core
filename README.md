# ChainCore — Accounting (Charts of Accounts)

A Next.js 14 (App Router) + TypeScript + Tailwind implementation of the ChainCore
core-banking **Charts of Accounts** and **General Ledger** experience, built from
the supplied design spec and screenshots.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The root path redirects to `/accounting/charts-of-account`.

```bash
npm run build && npm run start   # production
```

## What's implemented

| Screen | Route | Status |
|---|---|---|
| Charts of Account — All | `/accounting/charts-of-account` | ✅ |
| Charts of Account — Asset/Liability/Equity/Income/Expense | `…?tab=asset` etc. | ✅ |
| Create New General Ledger | `…/create` | ✅ |
| Success modal | (after create) | ✅ |
| GL detail / view | `…/:accountId` | ✅ |
| GL edit mode | `…/:accountId?edit=1` or "Save GL" toggle | ✅ |

### Features
- **App shell**: fixed 66px primary icon rail (with hover tooltips + active states)
  and a 250px Accounting sidebar that shows on list screens and hides on form screens.
- **URL-driven tabs**: the active category lives in `?tab=`. The **All** tab shows
  collapsed roots with a **Type** column; category tabs show the expanded hierarchy
  without it.
- **Hierarchical table**: recursive tree with expand/collapse chevrons, folder icons,
  per-level indentation, uppercase roots, `$0.00 Dr/Cr` amount formatting, and a
  per-row kebab menu (View / Edit / Add child / View transactions / Disable).
- **Search** filters by code/name/type and keeps parent chains visible.
- **Pagination bar**: rows-per-page, numbered pages, Prev/Next, Go-to-page, result count.
- **Create form**: 4-column field row, two accordion sections, checkbox, Notes
  textarea, sticky footer, and validation (required fields, code format, conditional
  Header Account requirement based on hierarchy type).
- **Accessibility**: aria-labels on icon buttons, `aria-selected` tabs, labeled fields,
  focus rings, and a focus-trapped modal.

### Not yet wired (intentional placeholders)
- **Filter** and **Export** buttons are styled but inert.
- Pagination total is fixed to "of 500" to match the reference; mock data has fewer
  real rows. Swap in a real data source / generated rows to make paging functional.
- "Save" actions don't persist (mock data is read-only in memory).

## Project structure

```
src/
  app/
    layout.tsx                       # root layout, font, metadata
    page.tsx                         # redirects to charts-of-account
    globals.css                      # Geist Mono @font-face + base styles
    accounting/charts-of-account/
      page.tsx                       # list screen (Suspense-wrapped)
      create/page.tsx                # create form + success modal
      [accountId]/page.tsx           # GL detail (Suspense-wrapped)
  components/
    PrimaryRail.tsx
    AccountingSidebar.tsx
    Common.tsx                       # Breadcrumbs, AskCoreAIButton
    AccountCategoryTabs.tsx
    ChartsToolbar.tsx
    ChartOfAccountsTable.tsx
    Pagination.tsx                   # scroll controls + pagination bar
    FormControls.tsx                 # TextInput, SelectInput, Checkbox, Textarea, SectionAccordion
    SuccessModal.tsx
    GLDetailClient.tsx
  data/
    accounts.ts                      # mock chart of accounts + lookup helpers
  lib/
    types.ts                         # ChartAccount model, tabs, formatAmount
public/
  fonts/GeistMono.ttf                # variable font (OFL licensed)
```

## Design tokens

Colours, radii, and typography from the spec are defined in `tailwind.config.ts`
(e.g. `primary #3157F6`, `border-strong #DDE3EA`, `surface-muted #F5F6F8`). Geist Mono
is the single typeface across the whole UI.

## Notes on the mock data

The screenshots contained placeholder inconsistencies (duplicate `1001200 Budpay`
rows, every amount `$40,000.00`, and conflicting root codes where INCOME was both
`300000` and `400000`). Per the spec's guidance, the mock data uses a clean, unique,
internally consistent scheme: Asset `100000`, Liability `200000`, Equity `300000`,
Income `400000`, Expense `500000`.
# Chain-Core
