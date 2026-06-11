import type { DropProduct } from "@/lib/drop-products";
import type { ShoppingIntent, StylePersona, StyleProfile } from "@/lib/style-profile";

export type Recommendation = {
  product: DropProduct;
  score: number;
  reasons: string[];
  stylingNote: string;
};

const personaCategoryBoosts: Record<StylePersona, Partial<Record<DropProduct["category"], number>>> = {
  minimal: { dress: 2, top: 2, skirt: 1, set: 2 },
  romantic: { dress: 3, top: 2, skirt: 2 },
  street: { jacket: 3, top: 2, skirt: 1 },
  polished: { jacket: 2, set: 3, dress: 2, top: 1 },
  experimental: { dress: 2, jacket: 2, set: 2, top: 2 },
};

const intentKeywords: Record<ShoppingIntent, string[]> = {
  work: ["office", "tailored", "pressed", "desk to dinner", "structured"],
  date: ["date night", "event", "silk touch", "mesh", "statement"],
  travel: ["travel", "soft knit", "layering", "weekend"],
  daily: ["soft", "layering", "denim", "weekend", "minimal"],
  event: ["event", "evening", "statement", "silk touch", "mesh"],
};

function hasTextMatch(product: DropProduct, needle: string) {
  const haystack = [product.title, product.brand, product.color, product.category, product.fitNote, ...product.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle.toLowerCase());
}

export function recommendProducts(profile: StyleProfile, products: DropProduct[]): Recommendation[] {
  return products
    .map((product) => {
      const reasons: string[] = [];
      let score = 0;

      const categoryBoost = personaCategoryBoosts[profile.persona][product.category] || 0;
      if (categoryBoost) {
        score += categoryBoost;
        reasons.push(`${product.category} fits your selected style direction`);
      }

      if (profile.colors.some((color) => product.color.toLowerCase().includes(color.toLowerCase()))) {
        score += 3;
        reasons.push(`${product.color} is in your preferred color lane`);
      }

      for (const intent of profile.intents) {
        const keywords = intentKeywords[intent];
        if (keywords.some((keyword) => hasTextMatch(product, keyword))) {
          score += 2;
          reasons.push(`Good match for ${intent.replace("daily", "daily wear")}`);
        }
      }

      if (profile.fitPriorities.includes("comfort") && hasTextMatch(product, "relaxed")) {
        score += 1;
        reasons.push("Comfort-friendly silhouette");
      }
      if (profile.fitPriorities.includes("length") && hasTextMatch(product, "long")) {
        score += 1;
        reasons.push("Length/proportion cue matches your fit priority");
      }
      if (profile.fitPriorities.includes("shoulder") && hasTextMatch(product, "shoulder")) {
        score += 1;
        reasons.push("Shoulder line is called out in the fit note");
      }

      if (reasons.length === 0) {
        reasons.push("Worth trying as a wildcard against your saved fit photo");
      }

      return {
        product,
        score,
        reasons: reasons.slice(0, 3),
        stylingNote: makeStylingNote(product, profile),
      };
    })
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title));
}

function makeStylingNote(product: DropProduct, profile: StyleProfile) {
  const firstIntent = profile.intents[0] || "daily";
  const tone = firstIntent === "date" ? "date-night" : firstIntent === "work" ? "work-ready" : firstIntent;
  return `${product.title} is a ${tone} candidate for ${profile.name || "you"}; try it once against your saved fit photo before checkout.`;
}
