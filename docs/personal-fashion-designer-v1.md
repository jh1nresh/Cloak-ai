# Cloak AI — Personal Fashion Designer V1

## Product thesis

Cloak should not be a one-off try-on toy where shoppers upload a photo for every garment. Cloak should become a personal fashion designer that learns a shopper's body, taste, closet, and shopping intent, then recommends pieces from Shopify or other storefronts that are likely to look good on them.

The V0 storefront proves the commerce loop:

```text
product drop → explicit photo upload → try-on preview → checkout
```

V1 should add a saved shopper profile:

```text
one-time style onboarding → personal fashion profile → recurring recommendations → selective try-on → checkout
```

## Core user promise

> Cloak remembers what looks good on you, so you do not have to try on every item manually.

## Why login matters

There is no login page in V0 because V0 is a campaign/drop artifact. V1 needs authentication to safely persist:

- user consent and privacy settings
- reference photos / generated avatar references
- body-shape and fit preferences
- style taste profile
- favorite brands, sizes, colors, budgets
- closet items or owned pieces
- rejected looks and positive feedback
- saved try-ons and shopping history

Use login for memory and privacy, not as a growth-wall.

## V1 onboarding flow

```text
Landing
→ Sign in / continue with magic link
→ upload 2–3 reference photos OR start with no-photo style quiz
→ choose style goals
→ choose fit sensitivities
→ pick liked/disliked outfits
→ generate personal fashion profile
→ recommendation feed
```

### Minimal auth

Start with one of:

- Clerk
- Supabase Auth
- NextAuth/Auth.js with magic links

Recommended for speed: Clerk or Supabase Auth.

Auth requirements:

- email magic link or OAuth
- authenticated profile route
- sign out
- server-side user id for profile data
- no public access to user photos or private profile data

## Personal fashion profile

A user profile should not be just measurements. It should combine visual, preference, and commerce signals.

```ts
type FashionProfile = {
  userId: string
  referenceImages: ReferenceImage[]
  avatarReferenceId?: string
  bodyNotes: string[]
  fitPreferences: FitPreference[]
  stylePillars: string[]
  colorPreferences: string[]
  avoidList: string[]
  favoriteBrands: string[]
  sizesByCategory: Record<string, string>
  budgetRange?: { min?: number; max?: number }
  occasions: string[]
  feedbackSignals: FeedbackSignal[]
}
```

Example style profile:

```text
Soft minimal eveningwear, fitted waist, long vertical lines, pearl/espresso/plum palette, avoids boxy cropped tops and loud logos, prefers dresses and matching sets under $200.
```

## Stop requiring per-item user photo uploads

Users should not upload a photo for every item. Use a tiered approach:

### Tier 1 — Recommendation without try-on

For most items, Cloak should score whether the piece matches the user's profile.

```text
product image + product metadata + user fashion profile
→ match score
→ why it works / why to skip
```

Output:

- `Looks promising`
- `Probably skip`
- `Try-on recommended`
- `Need better product photo`

### Tier 2 — Avatar/reference try-on

After onboarding, Cloak can generate try-ons using saved reference/avatar inputs instead of asking for a new photo each time.

```text
saved reference/avatar + garment image
→ try-on preview
```

This is the default for shoppers who opted in.

### Tier 3 — Fresh photo try-on

Only ask for a new upload when:

- user wants highest confidence for a specific purchase
- outfit requires current hair/makeup/body context
- the saved reference is stale
- the garment is unusually fit-sensitive

## Recommendation engine V1

The recommendation layer can work before real AI try-on is perfect.

Inputs:

- Shopify product feed or product URLs
- product images
- product title/description/price/category
- extracted attributes: silhouette, color, fabric, occasion, neckline, length, fit, vibe
- user fashion profile
- user feedback

Output:

```ts
type Recommendation = {
  productId: string
  score: number
  verdict: 'strong_match' | 'maybe' | 'skip' | 'try_on_first'
  reasons: string[]
  risks: string[]
  checkoutUrl: string
}
```

Example:

```text
Strong match — Plum Mesh Dress
- matches your plum/espresso palette
- long vertical silhouette fits your eveningwear preference
- side ruching gives waist definition
Risk: mesh fabric may feel too event-specific
```

## Commerce sources

Start with Shopify because it solves checkout/order/payment.

V1 commerce ingestion options:

1. Manual product feed in `products.ts`.
2. Shopify Storefront API for one brand.
3. Shopify product URL parser.
4. Later: multi-store crawler / affiliate links / browser extension.

Do not build marketplace/inventory/payment in V1.

## Key V1 pages

- `/login` — magic link/OAuth login
- `/onboarding` — style profile setup
- `/profile` — edit references, sizes, taste, privacy
- `/recommendations` — personalized feed
- `/products/[id]` — score + try-on + checkout
- `/privacy` — photo retention and consent

## Privacy requirements

- Explicit consent before saving reference photos.
- Separate consent for one-time preview vs persistent style profile.
- User can delete reference images and profile data.
- Do not claim exact size or fit accuracy.
- Do not send user photos to providers without clear consent copy.

## V1 MVP scope

Build only:

- Auth
- Style onboarding quiz
- Persisted fashion profile
- Local product feed
- deterministic + LLM-assisted recommendation scoring
- saved reference/avatar placeholder
- product detail with score/reasons
- optional mock try-on using saved reference

Do not build:

- full marketplace
- wardrobe scanner
- social feed
- exact measurements
- size guarantee
- checkout/payment logic
- unlimited store crawling

## Acceptance criteria

- User can sign in.
- User can complete onboarding and save fashion profile.
- User can see personalized recommendations without uploading a photo per item.
- Product detail explains why an item matches or fails.
- User can still run explicit try-on for selected items.
- Privacy page distinguishes one-time upload vs saved profile.
- Build/lint/typecheck pass.

## Product positioning

Weak:

> AI try-on app

Stronger:

> Your personal fashion designer for online shopping.

Sharpest:

> Cloak learns what looks good on you, then shops the internet with your taste and body in mind.
