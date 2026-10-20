export type Area = { x: number; y: number; width: number; height: number };

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
const toBlob = (c: HTMLCanvasElement, q: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", q));

/** Crop (optional) + resize to exact px on a white background (JPEG has no alpha). */
export async function renderCanvas(src: string, w: number, h: number, crop?: Area) {
  const img = await loadImage(src);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  const a = crop ?? { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
  ctx.drawImage(img, a.x, a.y, a.width, a.height, 0, 0, w, h);
  return c;
}

/** Binary-search JPEG quality so the file lands at or under maxKB, as close to it as possible. */
export async function compressToTarget(c: HTMLCanvasElement, maxKB: number) {
  const max = maxKB * 1024;
  let lo = 0.05, hi = 0.95, best: Blob | null = null;
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2, b = await toBlob(c, mid);
    if (b.size <= max) { best = b; lo = mid; } else hi = mid;
  }
  if (best) return { blob: best, reachedTarget: true };
  return { blob: await toBlob(c, 0.05), reachedTarget: false };
}
export const kb = (n: number) => (n / 1024).toFixed(1) + " KB";
