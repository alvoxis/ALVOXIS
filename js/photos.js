/* =========================================================
   ALVOXIS — PHOTOS

   Every photo is decoded and re-encoded in the browser
   before upload: that proves it is a real image, strips
   EXIF/location metadata, normalises it to JPEG and caps its
   size. The original filename is never used.

   Personalisation photos waiting in the cart are kept in
   IndexedDB on this device (they are too large for
   localStorage) until checkout uploads them to private
   storage.
   ========================================================= */

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const PHOTO_MAX_BYTES = 25 * 1024 * 1024;
const PHOTO_MIN_SIDE = 600;
const MAX_SIDE = 4000;
const MAX_PIXELS = 16000000; // iOS canvas limit is ~16.7 MP

export class PhotoError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // "type" | "size" | "decode" | "small"
  }
}

function decode(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoError("decode"));
    };
    img.src = url;
  });
}

function toJpeg(img, maxSide, quality) {
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(width, height), Math.sqrt(MAX_PIXELS / (width * height)));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparent PNGs print on white
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new PhotoError("decode"))), "image/jpeg", quality);
  });
}

/** validate + normalise a user-chosen file -> { blob, preview } */
export async function preparePhoto(file) {
  if (!file || (file.type && !PHOTO_TYPES.includes(file.type))) throw new PhotoError("type");
  if (file.size > PHOTO_MAX_BYTES) throw new PhotoError("size");

  const { img, url } = await decode(file);

  try {
    if (Math.min(img.naturalWidth, img.naturalHeight) < PHOTO_MIN_SIDE) throw new PhotoError("small");
    const blob = await toJpeg(img, MAX_SIDE, 0.92);
    const previewBlob = await toJpeg(img, 700, 0.82);
    const preview = await blobToDataUrl(previewBlob);
    return { blob, preview };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new PhotoError("decode"));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}


/* ---------- cart photo drafts (IndexedDB, this device only) ---------- */

const DB_NAME = "alvoxis";
const STORE = "cart-photos";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(result && "result" in result ? result.result : undefined);
    tx.onerror = () => reject(tx.error);
  });
}

export function saveDraftPhoto(key, blob) {
  return withStore("readwrite", (store) => store.put(blob, key));
}

export function loadDraftPhoto(key) {
  return withStore("readonly", (store) => store.get(key));
}

export function deleteDraftPhoto(key) {
  return withStore("readwrite", (store) => store.delete(key)).catch(() => {});
}
