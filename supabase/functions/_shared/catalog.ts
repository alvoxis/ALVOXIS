// ALVOXIS — the server-side source of truth for what things cost.
// The browser only ever sends a product id, a quantity and the
// personalisation; every amount charged comes from here.

export type ProductId = "mini" | "classic";

export interface Product {
  id: ProductId;
  name: string;
  unitAmount: number; // EUR cents
  priceEnv: string; // optional existing Stripe Price id, e.g. price_123
  personalization: { puzzleFormat: string; puzzlePieces: number; cardFormat: string };
}

export const PRODUCTS: Record<ProductId, Product> = {
  mini: {
    id: "mini",
    name: "ALVOXIS Mini Gift Box",
    unitAmount: 4999,
    priceEnv: "STRIPE_PRICE_MINI",
    personalization: { puzzleFormat: "A4", puzzlePieces: 120, cardFormat: "A6" },
  },
  classic: {
    id: "classic",
    name: "ALVOXIS Classic Gift Box",
    unitAmount: 5999,
    priceEnv: "STRIPE_PRICE_CLASSIC",
    personalization: { puzzleFormat: "A4", puzzlePieces: 120, cardFormat: "A6" },
  },
};

export const CURRENCY = "eur";
export const MAX_QUANTITY = 10;
export const MAX_LINES = 20;
export const MESSAGE_MAX = 240;

export const SUPPORT_MIN_CENTS = 100; // €1.00
export const SUPPORT_MAX_CENTS = 10000; // €100.00
export const GIFT_THRESHOLD_CENTS = 5000; // €50.00 unlocks the keepsake puzzle

export const LANGUAGES = ["en", "lv", "ru", "et", "lt"] as const;
export type Language = typeof LANGUAGES[number];

export function isProductId(value: unknown): value is ProductId {
  return value === "mini" || value === "classic";
}

export function parseLanguage(value: unknown): Language {
  return (LANGUAGES as readonly unknown[]).includes(value) ? value as Language : "en";
}

/**
 * "12", "12.5", "12.50", "12,50" -> 1250 cents.
 * Anything else — negative, NaN, more than 2 decimals, outside €1.00–€100.00 — -> null.
 */
export function parseSupportAmount(input: unknown): number | null {
  if (typeof input !== "string" && typeof input !== "number") return null;
  const text = String(input).trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents)) return null;
  if (cents < SUPPORT_MIN_CENTS || cents > SUPPORT_MAX_CENTS) return null;
  return cents;
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && new RegExp(`^${UUID}$`).test(value);
}

/** order photos live at <user_id>/<uuid>.<ext> in the private order-photos bucket */
export function isOwnOrderPhotoPath(path: unknown, userId: string): path is string {
  return typeof path === "string" && new RegExp(`^${userId}/${UUID}\\.(jpg|png|webp)$`).test(path);
}

export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}
