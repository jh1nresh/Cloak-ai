# Spec: Cloak AI V2 — AI Dressing Room

## Goal

Move Cloak from product-card try-on toward a personal dressing room:

```text
style profile + reusable model slot
→ central “you” model
→ outfits/products rotate around the model
→ like / skip / buy decisions
→ merchant checkout
```

The core product feeling should be: “I am standing in a digital dressing room, and the clothes change around me.” This is more consumer-magical than a grid of isolated product cards.

## User Flow

1. User creates a local style profile at `/login`.
2. User opens `/stylist`.
3. Cloak shows a central on-you model image for the currently selected look.
4. Side rails show previous/next looks and a scrollable dressing rail.
5. User can:
   - go previous / next
   - like a look
   - skip a look
   - reset reactions
   - buy via Shopify checkout placeholder
6. Liked/skipped reactions persist in browser localStorage.

## Current Implementation Boundary

### Included

- Next.js App Router + TypeScript + Tailwind.
- `/login` local-demo style onboarding.
- `/stylist` AI dressing-room UI.
- Central on-you mirror using `mockResultImageUrl`.
- Previous/next side previews.
- Scrollable dressing rail.
- Like / skip / buy / reset interactions.
- Browser-local profile and reaction storage.
- Existing gallery, product pages, mock try-on API, privacy page, and Shopify checkout boundary.

### Not Included

- Real backend auth/passwords/sessions.
- Real personal model image persistence.
- Real Shopify Storefront API or external catalog ingestion.
- Real AI try-on provider.
- Size/fit guarantee.
- Closet/wardrobe history.
- Payment/order handling.

## Product Decision Frame

Decision: make `/stylist` feel like a dressing room rather than another recommendation dashboard.

Options considered:

1. Keep ranked product-card grid.
2. Build a Chrome extension that replaces models in store pages.
3. Build a Cloak-owned dressing room with imported/catalog products around a central model.

Chosen tradeoff: Cloak-owned dressing room. It preserves the “every product modeled by you” magic while avoiding extension permissions, mobile weakness, and per-site DOM fragility.

Rejected alternative: extension-first. It is a strong eventual surface, but it is not the best first product because mobile commerce, privacy permissioning, site breakage, and agent memory are harder.

Expected outcome: user immediately understands Cloak as a personal dressing room: the model stays them, the clothes change, and the decision becomes like/skip/buy.

Verification: lint, typecheck, production build, npm audit, browser smoke of `/`, `/login`, `/stylist`, product page, and mock try-on API.

## Security Scan Receipt

- `npm audit --audit-level=moderate`: expected 0 vulnerabilities after dependency cleanup.
- Auth is demo-only: no password handling, no backend session, no cookies, no token storage.
- Profile and reactions are browser-local and resettable.
- Photo upload remains explicit and preview-scoped.
- Mock try-on provider receives no external credentials.

## Follow-Up After V2

1. Add `/model` for real reusable model creation, deletion, and consent.
2. Add `/import` for product URL / screenshot / Shopify product import.
3. Add `/rack` or merge imported products into `/stylist` dressing room.
4. Generate/cached on-you previews only for top-ranked products.
5. Connect real try-on provider behind explicit privacy and cost controls.
