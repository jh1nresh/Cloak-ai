# Cloak AI

Cloak AI is a Next.js V0 for a women’s fashion AI try-on drop storefront.

The goal is a campaign-style shopping page inspired by custom commerce drops: browse a small apparel collection, upload one photo, generate a demo try-on preview, compare the look, then leave for Shopify checkout.

## What this V0 includes

- Women’s fashion drop homepage
- Gallery-first product grid
- Search and category filters
- Product detail / try-on studio pages
- Explicit photo upload and consent copy
- Mock try-on API at `POST /api/drop-tryon`
- Before / garment / try-on comparison
- Per-product Shopify checkout URL boundary
- Lightweight privacy page

## What this V0 does not include

- Real payment/order handling
- Shopify Storefront API cart
- Accounts/login
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

- `/` — drop storefront gallery
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
3. Open a product.
4. Upload a photo.
5. Check the consent box.
6. Generate mock try-on.
7. Confirm comparison panels render.
8. Click `Buy with Shopify` and confirm it leaves Cloak.

## Privacy boundary

Cloak AI V0 only analyzes a photo the shopper explicitly uploads for this preview. The mock storefront does not persist uploads, create accounts, or process orders.
