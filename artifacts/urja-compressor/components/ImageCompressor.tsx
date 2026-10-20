"use client";
import { useEffect, useMemo, useState } from "react";
import {
  formatSpecLabel,
  PHOTO_SPECS,
  SIGNATURE_SPECS,
  specKey,
  type Spec,
} from "@/lib/presets";
import { renderCanvas, compressToTarget, kb, type Area } from "@/lib/imageUtils";
import { buildDownloadName } from "@/lib/fileNames";
import CropModal from "./CropModal";

type Kind = "photo" | "signature" | "custom";
const KINDS: { id: Kind; label: string }[] = [
  { id: "photo", label: "Photo" }, { id: "signature", label: "Signature" }, { id: "custom", label: "Custom size" },
];

export default function ImageCompressor() {
  const [kind, setKind] = useState<Kind>("photo");
  const [photoSpecKey, setPhotoSpecKey] = useState(specKey(PHOTO_SPECS[0]));
  const [signatureSpecKey, setSignatureSpecKey] = useState(specKey(SIGNATURE_SPECS[0]));
  const [custom, setCustom] = useState({ w: 600, h: 800, maxKB: 100, lock: true });
  const [src, setSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [orig, setOrig] = useState<{ ratio: number; size: number } | null>(null);
  const [crop, setCrop] = useState<Area | undefined>();
  const [cropping, setCropping] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const spec: Spec = useMemo(() => {
    if (kind === "custom") return { w: custom.w, h: custom.h, minKB: 0, maxKB: custom.maxKB };
    const options = kind === "signature" ? SIGNATURE_SPECS : PHOTO_SPECS;
    const selectedKey = kind === "signature" ? signatureSpecKey : photoSpecKey;
    return options.find((option) => specKey(option) === selectedKey) ?? options[0];
  }, [kind, photoSpecKey, signatureSpecKey, custom]);

  // Re-run automatically when inputs change
  useEffect(() => {
    if (!src) return;
    let dead = false;
    setBusy(true);
    (async () => {
      const c = await renderCanvas(src, spec.w, spec.h, crop);
      const { blob, reachedTarget } = await compressToTarget(c, spec.maxKB);
      if (dead) return;
      setResult((old) => { if (old) URL.revokeObjectURL(old.url); return { url: URL.createObjectURL(blob), size: blob.size, ok: reachedTarget }; });
      setBusy(false);
    })();
    return () => { dead = true; };
  }, [src, crop, spec]);

  function onFile(f?: File) {
    if (!f) return;
    setOriginalFileName(f.name);
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => { setOrig({ ratio: i.naturalWidth / i.naturalHeight, size: f.size }); setCrop(undefined); setSrc(url); setCropping(true); };
    i.src = url;
  }
  const setW = (w: number) => setCustom((c) => ({ ...c, w, h: c.lock && orig ? Math.round(w / orig.ratio) : c.h }));
  const setH = (h: number) => setCustom((c) => ({ ...c, h, w: c.lock && orig ? Math.round(h * orig.ratio) : c.w }));

  return (
    <div className="space-y-6">
      <div role="tablist" className="inline-flex rounded-md border border-beige bg-paper p-1">
        {KINDS.map((k) => (
          <button key={k.id} role="tab" aria-selected={kind === k.id} onClick={() => setKind(k.id)}
            className={`rounded px-4 py-1.5 text-sm transition ${kind === k.id ? "bg-moss text-cream" : "text-slate2 hover:text-moss"}`}>
            {k.label}
          </button>
        ))}
      </div>

      {kind !== "custom" ? (
        <div className="max-w-sm">
          <label className="mb-1 block text-sm text-slate2" htmlFor="size">Choose a size</label>
          <select
            id="size"
            className="field"
            value={kind === "signature" ? signatureSpecKey : photoSpecKey}
            onChange={(e) => kind === "signature"
              ? setSignatureSpecKey(e.target.value)
              : setPhotoSpecKey(e.target.value)}
          >
            {(kind === "signature" ? SIGNATURE_SPECS : PHOTO_SPECS).map((option) => (
              <option key={specKey(option)} value={specKey(option)}>{formatSpecLabel(option)}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid max-w-xl grid-cols-3 gap-3">
          <label className="text-sm text-slate2">Width (px)<input type="number" className="field mt-1" value={custom.w} onChange={(e) => setW(+e.target.value)} /></label>
          <label className="text-sm text-slate2">Height (px)<input type="number" className="field mt-1" value={custom.h} onChange={(e) => setH(+e.target.value)} /></label>
          <label className="text-sm text-slate2">Max size (KB)<input type="number" max={5120} className="field mt-1" value={custom.maxKB} onChange={(e) => setCustom({ ...custom, maxKB: Math.min(5120, +e.target.value) })} /></label>
          <label className="col-span-3 flex items-center gap-2 text-sm text-slate2">
            <input type="checkbox" className="accent-moss" checked={custom.lock} onChange={(e) => setCustom({ ...custom, lock: e.target.checked })} />
            Keep the original proportions
          </label>
        </div>
      )}

      <p className="text-sm text-slate2">
        Target: {spec.w} × {spec.h} px, {spec.minKB ? `${spec.minKB}–` : "under "}{spec.maxKB} KB{"note" in spec && spec.note ? ` (${spec.note})` : ""}
      </p>

      {!src ? (
        <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate2/40 bg-paper text-center transition hover:border-moss">
          <span className="font-serif text-xl text-moss">Choose a photo or signature</span>
          <span className="mt-1 text-sm text-slate2">JPG, PNG or WebP. It stays on this device.</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <figure>
            <div className="flex min-h-48 items-center justify-center rounded-md border border-beige bg-paper p-4">
              {result && <img src={result.url} alt="Compressed preview" style={{ width: Math.min(spec.w, 280) }} className="shadow-soft" />}
            </div>
            <figcaption className="mt-2 text-sm text-slate2">
              {busy ? "Working…" : result && (<>
                {kb(result.size)} {orig && <>from {kb(orig.size)}</>}
                {!result.ok && <span className="block text-[#8a4b1f]">Could not reach {spec.maxKB} KB at this size. Try a smaller width and height.</span>}
              </>)}
            </figcaption>
          </figure>
          <div className="flex flex-col items-start gap-3">
            <button className="btn-quiet" onClick={() => setCropping(true)}>Adjust crop</button>
            {result && originalFileName && <a className="btn" href={result.url} download={buildDownloadName(originalFileName, "jpg")}>Download JPG</a>}
            <button className="btn-quiet" onClick={() => { setSrc(null); setResult(null); setOrig(null); setOriginalFileName(null); setCrop(undefined); }}>Start over</button>
          </div>
        </div>
      )}

      {cropping && src && (
        <CropModal src={src} aspect={spec.w / spec.h} onCancel={() => setCropping(false)}
          onDone={(a) => { setCrop(a); setCropping(false); }} />
      )}
    </div>
  );
}
