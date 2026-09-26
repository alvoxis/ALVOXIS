/* =========================================================
   ALVOXIS — PRODUCT DATA
   Data-driven product config. Add/edit products here only.
   ========================================================= */

export const PRODUCTS = [
  {
    id: "mini",
    price: 49.99,
    currency: "EUR",
    available: true,
    images: [
      "assets/images/13B0048D-74F8-4511-8456-78D15FF53C36.png"
    ],
    personalization: {
      photo: true,
      message: true,
      puzzleFormat: "A4",
      puzzlePieces: 120,
      cardFormat: "A6"
    }
  },
  {
    id: "classic",
    price: 59.99,
    currency: "EUR",
    available: true,
    images: [
      "assets/images/IMG_0709.jpeg"
    ],
    personalization: {
      photo: true,
      message: true,
      puzzleFormat: "A4",
      puzzlePieces: 120,
      cardFormat: "A6"
    }
  },
  {
    id: "signature",
    price: null,
    currency: "EUR",
    available: false,
    images: [],
    personalization: {
      photo: true,
      message: true,
      puzzleFormat: "A4",
      puzzlePieces: 120,
      cardFormat: "A6"
    }
  }
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function formatPrice(price, currency) {
  if (price === null || price === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR"
  }).format(price);
}
