import { PDFDocument } from "pdf-lib";

/**
 * Browser-only PDF size reducer: each page is rendered to JPEG and the PDF rebuilt,
 * stepping scale/quality down until it fits. Text becomes an image (fine for form uploads,
 * not searchable).
 */
const STEPS = [{ s: 1.5, q: 0.7 }, { s: 1.2, q: 0.55 }, { s: 1.0, q: 0.45 }, { s: 0.8, q: 0.35 }, { s: 0.65, q: 0.28 }];

export async function compressPdf(file: File, maxBytes: number, onProgress?: (p: number) => void) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

  let last: Uint8Array | null = null;
  for (let si = 0; si < STEPS.length; si++) {
    const { s, q } = STEPS[si];
    const out = await PDFDocument.create();
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: s });
      const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
      const jpg = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", q));
      const img = await out.embedJpg(await jpg.arrayBuffer());
      out.addPage([base.width, base.height]).drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
      onProgress?.((si + n / doc.numPages) / STEPS.length);
    }
    last = await out.save();
    if (last.byteLength <= maxBytes) break;
  }
  const pdfBuffer = new ArrayBuffer(last!.byteLength);
  new Uint8Array(pdfBuffer).set(last!);
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  return { blob, reachedTarget: blob.size <= maxBytes };
}
