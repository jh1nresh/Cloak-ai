"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link as LinkIcon,
  LogOut,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import type { DropProduct } from "@/lib/drop-products";
import { recommendProducts, type Recommendation } from "@/lib/recommendations";
import {
  fitPriorityLabels,
  intentLabels,
  personaLabels,
  STYLE_PROFILE_STORAGE_KEY,
  createDefaultProfile,
  type StyleProfile,
} from "@/lib/style-profile";

type StylistDashboardProps = {
  products: DropProduct[];
};

type DressingRoomReaction = Record<string, "liked" | "skipped">;

type ImportFormState = {
  title: string;
  brand: string;
  price: string;
  color: string;
  category: DropProduct["category"];
  imageUrl: string;
  checkoutUrl: string;
};

const REACTION_STORAGE_KEY = "cloak-ai-dressing-room-reactions";
const IMPORTED_PRODUCTS_STORAGE_KEY = "cloak-ai-imported-products";
const IMPORT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80";

const defaultImportForm: ImportFormState = {
  title: "",
  brand: "Imported store",
  price: "$",
  color: "Imported",
  category: "dress",
  imageUrl: "",
  checkoutUrl: "",
};

function readProfile() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STYLE_PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StyleProfile;
  } catch {
    window.localStorage.removeItem(STYLE_PROFILE_STORAGE_KEY);
    return null;
  }
}

function readImportedProducts() {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(IMPORTED_PRODUCTS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as DropProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(IMPORTED_PRODUCTS_STORAGE_KEY);
    return [];
  }
}

function readReactions() {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(REACTION_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as DressingRoomReaction;
  } catch {
    window.localStorage.removeItem(REACTION_STORAGE_KEY);
    return {};
  }
}

function createDemoProfile(): StyleProfile {
  return {
    ...createDefaultProfile(),
    name: "You",
    email: "demo@cloak.ai",
    savedFitPhotoName: "demo model slot",
  };
}

export default function StylistDashboard({ products }: StylistDashboardProps) {
  const [profile, setProfile] = useState<StyleProfile>(() => createDemoProfile());
  const [reactions, setReactions] = useState<DressingRoomReaction>({});
  const [importedProducts, setImportedProducts] = useState<DropProduct[]>([]);
  const [importForm, setImportForm] = useState<ImportFormState>(() => defaultImportForm);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const loadBrowserState = window.setTimeout(() => {
      setProfile(readProfile() || createDemoProfile());
      setReactions(readReactions());
      setImportedProducts(readImportedProducts());
    }, 0);

    return () => window.clearTimeout(loadBrowserState);
  }, []);
  const rackProducts = useMemo(() => [...importedProducts, ...products], [importedProducts, products]);

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!profile) return [];
    return recommendProducts(profile, rackProducts);
  }, [rackProducts, profile]);
  const visibleRecommendations = useMemo(
    () => recommendations.filter((item) => reactions[item.product.id] !== "skipped"),
    [reactions, recommendations]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRecommendation = visibleRecommendations[activeIndex] || visibleRecommendations[0];
  const likedCount = Object.values(reactions).filter((reaction) => reaction === "liked").length;
  const skippedCount = Object.values(reactions).filter((reaction) => reaction === "skipped").length;

  const setReaction = (productId: string, reaction: DressingRoomReaction[string]) => {
    const next = { ...reactions, [productId]: reaction };
    setReactions(next);
    window.localStorage.setItem(REACTION_STORAGE_KEY, JSON.stringify(next));

    if (reaction === "skipped") {
      setActiveIndex((current) => Math.min(current, Math.max(visibleRecommendations.length - 2, 0)));
    }
  };

  const clearReactions = () => {
    setReactions({});
    window.localStorage.removeItem(REACTION_STORAGE_KEY);
    setActiveIndex(0);
  };

  const resetProfile = () => {
    window.localStorage.removeItem(STYLE_PROFILE_STORAGE_KEY);
    window.localStorage.removeItem(REACTION_STORAGE_KEY);
    setProfile(createDemoProfile());
    setReactions({});
  };

  const saveImportedProducts = (nextProducts: DropProduct[]) => {
    setImportedProducts(nextProducts);
    window.localStorage.setItem(IMPORTED_PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
  };

  const importProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = importForm.title.trim();
    const checkoutUrl = importForm.checkoutUrl.trim();

    if (!title) {
      setImportError("Add a product name so Cloak can place it in your rack.");
      return;
    }

    const safeCheckoutUrl = checkoutUrl || "https://cloak-demo.myshopify.com/cart/imported-product:1";
    const imageUrl = importForm.imageUrl.trim() || IMPORT_FALLBACK_IMAGE;
    const importedProduct: DropProduct = {
      id: `imported-${Date.now()}`,
      title,
      brand: importForm.brand.trim() || "Imported store",
      price: importForm.price.trim() || "Price TBD",
      color: importForm.color.trim() || "Imported",
      category: importForm.category,
      imageUrl,
      garmentImageUrl: imageUrl,
      mockResultImageUrl: imageUrl,
      checkoutUrl: safeCheckoutUrl,
      tags: ["imported", "personal rack"],
      fitNote: "Imported into your Cloak rack for a quick on-you vibe check before checkout.",
    };

    saveImportedProducts([importedProduct, ...importedProducts]);
    setImportForm(defaultImportForm);
    setImportError(null);
    setActiveIndex(0);
  };

  const clearImportedProducts = () => {
    saveImportedProducts([]);
    setActiveIndex(0);
  };

  const heroName = profile.name || "You";

  if (!activeRecommendation) {
    return (
      <main className="min-h-dvh bg-background text-primary">
        <section className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-4 text-center">
          <p className="section-title">Rack cleared</p>
          <h1 className="mt-3 font-serif text-5xl leading-none">You skipped the whole rack.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Reset reactions to bring the current catalog back, or edit your style brief to pull a different rack.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn-primary" onClick={clearReactions}>
              Reset rack
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <Link href="/login" className="btn-outline">
              Edit style
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const activeProduct = activeRecommendation.product;
  const nextProduct = visibleRecommendations[(activeIndex + 1) % visibleRecommendations.length]?.product;
  const previousProduct =
    visibleRecommendations[(activeIndex - 1 + visibleRecommendations.length) % visibleRecommendations.length]?.product;

  return (
    <main className="min-h-dvh bg-background text-primary">
      <header className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-black uppercase tracking-[0.14em]">
            Cloak
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-outline h-9 px-3 text-xs">
              Edit model
            </Link>
            <button type="button" className="btn-outline h-9 px-3 text-xs" onClick={resetProfile}>
              <LogOut size={14} aria-hidden="true" />
              Reset
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:px-8">
        <aside className="order-2 border border-line bg-[#221d1b] p-4 text-white lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Your model</p>
          <h1 className="mt-3 font-serif text-4xl leading-[0.95]">
            {heroName === "You" ? "Your dressing room" : `${heroName}'s dressing room`}
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            One reusable style brief. A central “you” model. Swipe the rack, like the looks that work, and buy when it feels obvious.
          </p>
          <div className="mt-5 grid gap-2 text-sm">
            <ProfileLine label="Designer mode" value={personaLabels[profile.persona]} />
            <ProfileLine label="Shopping for" value={profile.intents.map((intent) => intentLabels[intent]).join(", ")} />
            <ProfileLine label="Color lane" value={profile.colors.join(", ")} />
            <ProfileLine label="Fit guardrails" value={profile.fitPriorities.map((fit) => fitPriorityLabels[fit]).join(", ")} />
            <ProfileLine label="Reusable fit photo" value={profile.savedFitPhotoName || "Model slot pending"} />
            <ProfileLine label="Imported pieces" value={`${importedProducts.length} in rack`} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm">
            <div className="border border-white/10 bg-white/5 p-3">
              <p className="text-2xl font-semibold">{likedCount}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">liked</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3">
              <p className="text-2xl font-semibold">{skippedCount}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">skipped</p>
            </div>
          </div>
        </aside>

        <section className="order-1 border border-line bg-panel p-3 lg:order-2">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <p className="section-title">AI dressing room</p>
              <h2 className="mt-1 text-2xl font-semibold">Every piece is modeled by you.</h2>
              <p className="mt-1 text-xs text-muted">Seed catalog + anything you import into Cloak.</p>
            </div>
            <span className="hidden border border-[#781f38] bg-[#781f38] px-2 py-1 text-[11px] font-semibold uppercase text-white sm:inline-flex">
              mock on-you rack
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[96px_minmax(0,1fr)_96px]">
            <SidePreview label="previous" product={previousProduct} onClick={() => setActiveIndex((activeIndex - 1 + visibleRecommendations.length) % visibleRecommendations.length)} />

            <div className="relative overflow-hidden border border-line bg-[#f3f0ea]">
              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                <span className="bg-panel px-2 py-1 text-[11px] font-semibold uppercase text-primary shadow-sm">
                  On {heroName}
                </span>
                <span className="bg-[#221d1b] px-2 py-1 text-[11px] font-semibold uppercase text-white shadow-sm">
                  score {activeRecommendation.score}
                </span>
              </div>
              <img
                src={activeProduct.mockResultImageUrl}
                alt={`${activeProduct.title} modeled by ${heroName}`}
                className="mx-auto h-[58dvh] min-h-[520px] w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{activeProduct.brand}</p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-3xl font-semibold leading-tight">{activeProduct.title}</h3>
                    <p className="mt-1 text-sm text-white/75">
                      {activeProduct.color} · {activeProduct.price}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary"
                      aria-label={`Skip ${activeProduct.title}`}
                      onClick={() => setReaction(activeProduct.id, "skipped")}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e4516f] text-white"
                      aria-label={`Like ${activeProduct.title}`}
                      onClick={() => setReaction(activeProduct.id, "liked")}
                    >
                      <Heart size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <SidePreview label="next" product={nextProduct} onClick={() => setActiveIndex((activeIndex + 1) % visibleRecommendations.length)} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setActiveIndex((activeIndex - 1 + visibleRecommendations.length) % visibleRecommendations.length)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
              Previous look
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setActiveIndex((activeIndex + 1) % visibleRecommendations.length)}
            >
              Next look
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <a href={activeProduct.checkoutUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              Looks good — buy
              <ShoppingBag size={17} aria-hidden="true" />
            </a>
          </div>
        </section>

        <aside className="order-3 grid gap-4">
          <div className="border border-line bg-panel p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={17} aria-hidden="true" />
              <p className="section-title">Why this look</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{activeRecommendation.stylingNote}</p>
            <ul className="mt-4 grid gap-2 text-sm text-muted">
              {activeRecommendation.reasons.map((reason) => (
                <li key={reason} className="flex gap-2 border border-line bg-white p-2">
                  <Check className="mt-0.5 shrink-0 text-[#6c7d6a]" size={16} aria-hidden="true" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="border border-line bg-panel p-4" onSubmit={importProduct}>
            <div className="flex items-center gap-2">
              <LinkIcon size={17} aria-hidden="true" />
              <p className="section-title">Import product</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Paste a product manually for now. Cloak pulls it into your personal rack and treats the product image as the mock on-you preview.
            </p>
            <div className="mt-4 grid gap-2">
              <input
                className="input"
                value={importForm.title}
                onChange={(event) => setImportForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Product name"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  value={importForm.brand}
                  onChange={(event) => setImportForm((current) => ({ ...current, brand: event.target.value }))}
                  placeholder="Brand"
                />
                <input
                  className="input"
                  value={importForm.price}
                  onChange={(event) => setImportForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Price"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  value={importForm.color}
                  onChange={(event) => setImportForm((current) => ({ ...current, color: event.target.value }))}
                  placeholder="Color"
                />
                <select
                  className="input"
                  value={importForm.category}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, category: event.target.value as DropProduct["category"] }))
                  }
                >
                  <option value="dress">Dress</option>
                  <option value="top">Top</option>
                  <option value="jacket">Jacket</option>
                  <option value="skirt">Skirt</option>
                  <option value="set">Set</option>
                </select>
              </div>
              <input
                className="input"
                value={importForm.imageUrl}
                onChange={(event) => setImportForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="Image URL optional"
              />
              <input
                className="input"
                value={importForm.checkoutUrl}
                onChange={(event) => setImportForm((current) => ({ ...current, checkoutUrl: event.target.value }))}
                placeholder="Checkout/product URL optional"
              />
              {importError ? <p className="border border-[#b42318] bg-[#fff7f6] p-2 text-xs font-semibold text-[#8a1f15]">{importError}</p> : null}
              <button type="submit" className="btn-primary w-full">
                Add to my rack
              </button>
            </div>
          </form>

          <div className="border border-line bg-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-title">Dressing rail</p>
                <h3 className="mt-1 text-xl font-semibold">Tap any look</h3>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-outline h-9 px-3 text-xs" onClick={clearImportedProducts}>
                  Clear imports
                </button>
                <button type="button" className="btn-outline h-9 px-3 text-xs" onClick={clearReactions}>
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4 grid max-h-[520px] gap-2 overflow-y-auto pr-1">
              {visibleRecommendations.slice(0, 12).map((item, index) => {
                const isActive = item.product.id === activeProduct.id;
                const reaction = reactions[item.product.id];
                return (
                  <button
                    key={item.product.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`grid grid-cols-[72px_1fr] gap-3 border p-2 text-left transition ${
                      isActive ? "border-primary bg-[#f3f0ea]" : "border-line bg-white hover:border-primary"
                    }`}
                  >
                    <img
                      src={item.product.mockResultImageUrl}
                      alt={`${item.product.title} on ${heroName}`}
                      className="aspect-[3/4] w-full object-cover object-top"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-primary">{item.product.title}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {item.product.color} · {item.product.price}
                      </span>
                      {item.product.id.startsWith("imported-") ? (
                        <span className="mt-2 inline-flex bg-[#221d1b] px-2 py-1 text-[10px] font-semibold uppercase text-white">
                          imported
                        </span>
                      ) : null}
                      {reaction === "liked" ? (
                        <span className="mt-2 inline-flex bg-[#e4516f] px-2 py-1 text-[10px] font-semibold uppercase text-white">
                          liked
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SidePreview({ label, product, onClick }: { label: string; product?: DropProduct; onClick: () => void }) {
  if (!product) return <div className="hidden lg:block" />;

  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden overflow-hidden border border-line bg-white text-left opacity-80 transition hover:opacity-100 lg:block"
      aria-label={`Show ${label} look: ${product.title}`}
    >
      <img src={product.mockResultImageUrl} alt={product.title} className="h-full min-h-[520px] w-full object-cover object-top" />
    </button>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}
