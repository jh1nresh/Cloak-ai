# Cloak AI

Cloak AI is a Next.js V2 for a women’s AI dressing room + personal fashion agent.

The goal is to stop making shoppers evaluate isolated product cards. Cloak keeps the user/model in the center, moves outfits around them, remembers a lightweight style profile, and turns the rack into `like / skip / buy` decisions.

## What this V2 includes

- AI dressing room at `/stylist`
- Central “on you” model view using mock generated images
- Previous/next side previews like a dressing-room mirror rail
- `Like`, `Skip`, `Looks good — buy`, and rack reset actions
- Browser-local reactions for liked/skipped looks
- Women’s fashion drop homepage
- Gallery-first product grid
- Local-demo login / style onboarding at `/login`
- Personal stylist dashboard at `/stylist`
- Browser-local style profile storage
- Rule-based recommendation ranking from the local catalog
- Search and category filters
- Product detail / try-on studio pages
- Explicit photo upload and consent copy
- Mock try-on API at `POST /api/drop-tryon`
- Before / garment / try-on comparison
- Per-product Shopify checkout URL boundary
- Lightweight privacy page

## What this V1 does not include

- Real payment/order handling
- Shopify Storefront API cart
- Real backend authentication or password storage
- Real image/avatar persistence
- Size recommendation
- Wardrobe/history
- Real AI provider credentials
- Claims about fit, sizing, body measurements, or garment physics

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react icons
- Local product catalog in `lib/drop-products.ts`
- Mock try-on provider in `lib/tryon/mock-provider.ts`

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If your shell resolves an old Node version, use Node `>=20.9.0` for Next.js 16, for example:

```bash
PATH=/Users/jhinresh/.nvm/versions/node/v24.1.0/bin:$PATH npm run dev
```

## Useful routes

- `/` — personal stylist landing + drop storefront gallery
- `/login` — local-demo login and style onboarding
- `/stylist` — AI dressing room with central on-you model and like/skip/buy rail
- `/products/satin-column-slip` — product try-on studio example
- `/privacy` — upload consent and privacy copy
- `/api/drop-tryon` — mock try-on API

## Product data

Edit products in:

```text
lib/drop-products.ts
```

Each product has:

- `id`
- `title`
- `brand`
- `price`
- `color`
- `category`
- `imageUrl`
- `garmentImageUrl`
- `mockResultImageUrl`
- `checkoutUrl`
- `tags`
- `fitNote`

Replace placeholder Shopify URLs with real product/cart checkout URLs when connecting an actual store.

## Mock try-on API

`POST /api/drop-tryon` accepts multipart form data:

- `productId`: product id from `lib/drop-products.ts`
- `photo`: JPG, PNG, WebP, HEIC, or HEIF image up to 8MB

The mock provider validates the request and returns the selected product’s `mockResultImageUrl`. No AI provider secret is required.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run check
```

Manual smoke test:

1. Open `/`.
2. Search/filter products.
3. Open `/login`, enter a demo email, choose persona/colors/intents/fit guardrails, and create stylist.
4. Confirm `/stylist` ranks recommendations and links to a product.
5. Open a product.
6. Upload a photo.
7. Check the consent box.
8. Generate mock try-on.
9. Confirm comparison panels render.
10. Click `Buy with Shopify` and confirm it leaves Cloak.

## Privacy boundary

Cloak AI V1 stores the style profile and demo login in browser localStorage and only analyzes a photo the shopper explicitly uploads for a preview. The mock storefront does not persist uploads, create backend accounts, or process orders.
